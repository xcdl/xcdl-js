/*
 * This file is part of the XCDL distribution 
 *   (http://xcdl.github.io).
 * Copyright (c) 2016 Liviu Ionescu.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict'

// ----------------------------------------------------------------------------  
// Dependencies.  
const fs = require('fs')
const path = require('path')

// https://www.npmjs.com/package/shopify-liquid
const Liquid = require('shopify-liquid')

const utilsMisc = require('../../utils/misc.js')
const liquid = require('../../utils/liquid.js')
const asy = require('../../utils/asy.js')

// ----------------------------------------------------------------------------  

const writeFile = asy.promisify(fs.writeFile)

// ----------------------------------------------------------------------------  

// The module returns an object, with a method run().
// All other vars are local to this module.
var code = {}
module.exports = code

// ----------------------------------------------------------------------------  

var ctx
var svd
var vendorPrefix    // Upper case
var deviceFamily    // Upper case
var deviceSelector  // Upper case

var codeFolder
var engine

// ----------------------------------------------------------------------------  

var usage = function () {
  var str = 'Usage:\n'
  str += 'xcdl svd-code \n'
  str += '   --file in.json - input file\n'
  str += '   [--dest folder] - destination folder, default SVD device name\n'
  str += '   [--vendor-prefix prefix] - string, like STM32\n'
  str += '   [--device-family family] - string, like F4\n'
  str += '   [--device-selector family] - string, like 40x\n'
  return str
}

code.run = function (context, args, callback) {

  ctx = context

  if (args.length < 3) {
    return callback(new Error(usage()))
  }

  ctx.console.log('Generate the QEMU support code from the .json file.')

  var inputPath

  var i
  for (i = 1; i < args.length; ++i) {
    if (args[i] === '--file') {
      inputPath = args[i + 1]
      ++i
    } else if (args[i] === '--dest') {
      codeFolder = args[i + 1]
      ++i
    } else if (args[i] === '--vendor-prefix') {
      vendorPrefix = args[i + 1].toUpperCase()
      ++i
    } else if (args[i] === '--device-family') {
      deviceFamily = args[i + 1].toUpperCase()
      ++i
    } else if (args[i] === '--device-selector') {
      deviceSelector = args[i + 1].toUpperCase()
      ++i
    }
  }

  if (!inputPath) {
    return callback(new Error(usage()))
  }

  var inputData
  try {
    inputData = fs.readFileSync(inputPath, 'utf8')
  } catch (err) {
    // ctx.console.log(er.message)
    return callback(err)
  }
  ctx.console.log(`\nInput file '${inputPath}' read.`)

  svd = JSON.parse(inputData)

  try {
    validate()
  } catch (err) {
    return callback(err)
  }

  if (!codeFolder) {
    codeFolder = svd.device.name
  }

  // List the peripherals existing in the input file.  
  var periph_array = []
  svd.device.peripherals.forEach((peripheral) => {
    if (peripheral.registers) {
      if (peripheral.qemuGroupName) {
        periph_array.push(`${peripheral.qemuGroupName}(${peripheral.name})`)
      } else {
        periph_array.push(`${peripheral.name}`)
      }
    }
  });
  ctx.console.log(`Peripherals: ${periph_array.join(' ')}\n`);


  // Defaults for STM32 devices.
  if (svd.device.name.startsWith('STM32')) {
    vendorPrefix = 'STM32'
    deviceFamily = svd.device.name.substr(5, 2).toUpperCase()
    deviceSelector = svd.device.name.substr(6).toLowerCase()
  }

  // Synchronous calls, 
  if (!fs.existsSync(codeFolder)) {
    fs.mkdirSync(codeFolder)
  }

  engine = Liquid({
    root: path.resolve(ctx.packagePath, 'assets/templates')
    , extname: '.liquid'
    , cache: false
    , strict_filters: true       // default: false 
    , strict_variables: true     // default: false
    , trim_right: true            // default: false
  })


  // Usage: {{ name | c_reserved }} 
  engine.registerFilter('c_reserved', liquid.tag_c_keywords);
  // Usage: {{ name | to_uint }} 
  engine.registerFilter('to_uint', liquid.tag_to_uint);
  // Usage: {{ name | to_hex }} 
  engine.registerFilter('to_hex', liquid.tag_to_hex);
  // Usage: {{ name | rw_bits }} 
  engine.registerFilter('rw_bits', liquid.tag_rw_bits);


  // Generate helper code, headers and source files, for all peripherals.
  var peripherals = []
  svd.device.peripherals.forEach((peripheral, index, array) => {
    if (peripheral.registers) {
      peripherals.push(generatePeripheralFiles(peripheral))
    }
  })

  Promise.all(peripherals).then(() => {
    callback(null)
  }).catch(err => {
    callback(err)
  })

  return
}

// ----------------------------------------------------------------------------

const validate = function () {
  if (!svd.device) {
    throw new Error(`Mandatory 'device' missing.`)
  }
  if (!svd.device.peripherals) {
    throw new Error(`Mandatory 'device.peripherals' missing.`)
  }
}

// ----------------------------------------------------------------------------

const generatePeripheralFiles = function (peripheral) {
  return new Promise((resolve, reject) => {
    var code_h = codeFolder + `/${peripheral.name.toLowerCase()}.h`
    var code_c = codeFolder + `/${peripheral.name.toLowerCase()}.c`

    if (peripheral.registers) {

      // An array of 2 promises, one for each template.
      const pa = [
        engine.renderFile('qemu-peripherals-h.liquid', {
          vendorPrefix: vendorPrefix, // Uppercase
          deviceFamily: deviceFamily, // Uppercase
          deviceName: svd.device.name,
          deviceSelector: deviceSelector, // Lowercase
          peripherals: svd.device.peripherals,
          peripheral: peripheral
        })
        , engine.renderFile('qemu-peripherals-c.liquid', {
          vendorPrefix: vendorPrefix, // Uppercase
          deviceFamily: deviceFamily, // Uppercase
          deviceName: svd.device.name,
          deviceSelector: deviceSelector, // Lowercase
          peripheral: peripheral
        })]

      Promise.all(pa).then((va) => {
        // The result is an ordered array of two parsed jsons.
        return Promise.all([
          writeFile(code_h, va[0], 'utf8')
          , writeFile(code_c, va[1], 'utf8')])
      }).then(() => {
        ctx.console.log(`Header file '${code_h}' written.`)
        ctx.console.log(`Source file '${code_c}' written.`)
        resolve()
      })
    } else {
      resolve();
    }
  })
}

// ----------------------------------------------------------------------------
