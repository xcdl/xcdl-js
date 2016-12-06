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

// --------------------------------------------------------------------------  
// Dependencies.  
const fs = require('fs')
const path = require('path')

const generateX = require('../utils/generate-x.js')

// --------------------------------------------------------------------------  

// The module returns an object, with a method run().
// All other vars are local to this module.
var patchXsvd = {}
module.exports = patchXsvd

// ----------------------------------------------------------------------------  

var inputJson

// ----------------------------------------------------------------------------  

patchXsvd.run = function (context, args, callback) {

  if (args.length < 7) {
    context.console.log('Usage:')
    context.console.log('  xcdl patch-xsvd -i in.json -p patch.json -o out.json')

    callback(null)
    return
  }

  context.console.log('Patch xsvd.json.')

  var inputPath
  var patchPath
  var outputPath
  var i
  for (i = 1; i < args.length; ++i) {
    if (args[i] === '-i') {
      inputPath = args[i + 1]
      ++i
    } else if (args[i] === '-p') {
      patchPath = args[i + 1]
      ++i
    } else if (args[i] === '-o') {
      outputPath = args[i + 1]
      ++i
    }
  }

  // var inputSvd = path.basename(inputPath)

  var inputData
  try {
    inputData = fs.readFileSync(inputPath, 'utf8')
  } catch (err) {
    // context.console.log(er.message)
    return callback(err)
  }
  context.console.log("'" + inputPath + "' read.")

  var patchData
  try {
    patchData = fs.readFileSync(patchPath, 'utf8')
  } catch (err) {
    // context.console.log(er.message)
    return callback(err)
  }
  context.console.log("'" + patchPath + "' read.")

  var svd = JSON.parse(inputData)
  var patch = JSON.parse(patchData)

  if (patchSvd(context, svd, patch)) {

    generateX.addGenerator(svd, 'xcdl', args)
    
    var out = JSON.stringify(svd, null, '\t')

    var dirPath = path.dirname(outputPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
    fs.writeFileSync(outputPath, out, 'utf8')
    context.console.log("'" + outputPath + "' written.")
  }
  return callback(null)
}

// ----------------------------------------------------------------------------

var patchSvd = function (context, svd, patch) {
  if (!svd.device || !svd.device.name || !svd.generators) {
    context.console.log("Input file not a SVD.")
    return false
  }
  if (!patch.device || !patch.device.name) {
    context.console.log("Patch file not a SVD.")
    return false
  }

  if (svd.device.name !== patch.device.name) {
    context.console.log("Patch refer to different device.")
    return false
  }

  if (patch.device.cpu) {
    // Possibly patch the cpu object.
    if (!svd.device.cpu) {
      // It is not present at all, copy entirely object.
      svd.device.cpu = patch.device.cpu
      context.console.log('\'cpu\' added.')
    } else {
      for (var key in patch.device.cpu) {
        if (!svd.device.cpu[key]) {
          // Copy only missing properties.
          svd.device.cpu[key] = patch.device.cpu[key]
          context.console.log(`cpu.${key} added.`)
        }
      }
    }
  }

  return true  
}
