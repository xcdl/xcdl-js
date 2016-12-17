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

const utilsMisc = require('../../utils/misc.js')

// ----------------------------------------------------------------------------  

// The module returns an object, with a method run().
// All other vars are local to this module.
var patch = {}
module.exports = patch

// ----------------------------------------------------------------------------  

var ctx
var groupBitFields = []
var svd
var removeNodes = []

// ----------------------------------------------------------------------------  

patch.run = function (context, args, callback) {

  ctx = context

  if (args.length < 7) {
    ctx.console.log('Usage:')
    ctx.console.log('  xcdl svd patch --file in.json --patch patch.json --output out.json')

    callback(null)
    return
  }

  ctx.console.log('Modify an XSVD .json file using command line options and a patch file.')

  var inputPath
  var patchPath
  var outputPath

  var i
  for (i = 1; i < args.length; ++i) {
    if (args[i] === '--file') {
      inputPath = args[i + 1]
      ++i
    } else if (args[i] === '--patch') {
      patchPath = args[i + 1]
      ++i
    } else if (args[i] === '--output') {
      outputPath = args[i + 1]
      ++i
    } else if (args[i] === '--group-bitfield') {
      groupBitFields.push(args[i + 1])
      ++i
    } else if (args[i] === '--remove') {
      removeNodes.push(args[i + 1])
    }
  }

  // var inputSvd = path.basename(inputPath)

  var inputData
  try {
    inputData = fs.readFileSync(inputPath, 'utf8')
  } catch (err) {
    // ctx.console.log(er.message)
    return callback(err)
  }
  ctx.console.log(`\nInput file '${inputPath}' read.`)

  svd = JSON.parse(inputData)

  if (!validate()) {
    return callback(null)
  }

  reorderBitfields(svd.device)

  var periph_array = []
  svd.device.peripherals.forEach(periph => periph_array.push(periph.name));
  ctx.console.log(`Peripherals: ${periph_array.join(' ')}`);

  var patchData
  try {
    patchData = fs.readFileSync(patchPath, 'utf8')
  } catch (err) {
    // context.console.log(er.message)
    return callback(err)
  }
  ctx.console.log(`\nPatch file '${patchPath}' read.`)

  var patch = JSON.parse(patchData)

  if (!patchSvd(patch)) {
    return callback(null)
  }

  var dirPath
  var out

  utilsMisc.addGenerator(svd, 'xcdl', ctx.packageJson.version, args)
  out = JSON.stringify(svd, null, '\t')

  var dirPath = path.dirname(outputPath)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  fs.writeFileSync(outputPath, out, 'utf8')
  ctx.console.log(`\nOutput file '${outputPath}' written.`)

  return callback(null)
}

// ----------------------------------------------------------------------------

var validate = function () {
  if (!svd.device) {
    ctx.console.error(`Mandatory 'device' missing.`)
    return false
  }
  if (!svd.device.peripherals) {
    ctx.console.error(`Mandatory 'device.peripherals' missing.`)
    return false
  }
  return true
}

var reorderBitfields = function (node) {

  if (node.peripherals) {
    node.peripherals.forEach(peripheral => {
      reorderBitfields(peripheral)
    })
  }
  if (node.registers) {
    node.registers.forEach(reg => {
      reorderBitfields(reg)
    })
  }
  if (node.fields) {
    node.fields.sort((f1, f2) => {
      // Return a negative value if f1 < f2; compare bit offsets.
      return parseInt(f1.bitOffset, 10) - parseInt(f2.bitOffset, 10)
    })
  }
}

var patchSvd = function (patch) {
  if (!svd.device || !svd.device.name || !svd.generators) {
    ctx.console.error('Input file not a SVD.')
    return false
  }
  if (!patch.device || !patch.device.name) {
    ctx.console.error('Patch file not a SVD.')
    return false
  }

  if (svd.device.name !== patch.device.name) {
    ctx.console.error('Patch refer to different device.')
    return false
  }

  ctx.console.log('\nChanges:')

  removeNodes.forEach(path => {
    var [element, index, array] = findObject(svd, path.split('/'))
    if (element) {
      ctx.console.log(`- node '${path}' removed`)
      array.splice(index, 1)
    }
  })

  if (patch.device.cpu) {
    // Possibly patch the cpu object.
    if (!svd.device.cpu) {
      // It is not present at all, copy entirely object.
      svd.device.cpu = patch.device.cpu
      ctx.console.log(`- 'cpu' added from patch`)
    } else {
      for (var key in patch.device.cpu) {
        if (!svd.device.cpu[key]) {
          // Copy only missing properties.
          svd.device.cpu[key] = patch.device.cpu[key]
          ctx.console.log(`cpu.${key} added.`)
        }
      }
    }
  }

  compareAndUpdate(patch.device, svd.device)

  for (var i = 0; i < groupBitFields.length; ++i) {
    doGroupBitfield(groupBitFields[i])
  }
  return true
}

var doGroupBitfield = function (path) {
  // ctx.console.log(path)

  var pa = path.split('/')
  if (pa.length < 2) {
    ctx.console.error(`Path ${path} must be at least two levels deep.`)
    return null
  }
  var bitfield_name = pa.pop()
  var path_prefix = pa.join('/') + '/'

  var [register, ,] = findObject(svd, pa.slice())

  if (register.fields) {
    var minOffset = 32
    var maxOffset = 0
    var preservedField;

    for (var i = 0; i < register.fields.length; ++i) {
      var field = register.fields[i];
      var re = new RegExp(bitfield_name + '[0-9]+')
      if (field.name.match(re)) {
        var full_name = path_prefix + field.name

        // ctx.console.log(field.name)
        if (field.bitWidth !== "1") {
          ctx.console.error(`Field ${field} has bitWidth != 1.`)
          return null
        }

        if (preservedField) {
          if (field.access !== preservedField.access) {
            ctx.console.error(`Field ${full_name} has different access.`)
          }
        }

        var offset = parseInt(field.bitOffset, 10)
        if (offset < minOffset) {
          minOffset = offset
        }
        if (offset > maxOffset) {
          maxOffset = offset
        }


        if (preservedField) {
          // Remove subsequent fields in the same group
          // ctx.console.log(`- field ${full_name} removed`)

          register.fields.splice(i, 1)
          i--
        } else {
          preservedField = field
        }
      }
    }
    var prev_name = path_prefix + preservedField.name
    preservedField.name = bitfield_name
    preservedField.bitOffset = minOffset.toString()
    preservedField.bitWidth = (maxOffset - minOffset + 1).toString()
    var name = path_prefix + bitfield_name
    // ctx.console.log(`- field ${prev_name} renamed ${name} and grouped from ${maxOffset - minOffset + 1} single bit fields`)
    ctx.console.log(`- field ${name} grouped from ${maxOffset - minOffset + 1} single bit fields`)

  } else {
    return null
  }
}

// Find peripherals, register, bitfields.
// Return a triplet [value, index, array] or null
var findObject = function (svd_node, path_array, depth = 0) {
  var name = path_array[0]
  path_array.splice(0, 1)

  if (svd_node.device && svd_node.device.peripherals) {
    // Search peripherals
    var peripherals = svd_node.device.peripherals
    for (var i = 0; i < peripherals.length; ++i) {
      var peripheral = peripherals[i];
      if (peripheral.name === name) {
        if (path_array.length == 0) {
          return [peripheral, i, peripherals]
        } else {
          return findObject(peripheral, path_array, depth + 1)
        }
      }
    }
  }

  if (svd_node.registers) {
    for (var i = 0; i < svd_node.registers.length; ++i) {
      var register = svd_node.registers[i];
      if (register.name === name) {
        if (path_array.length == 0) {
          return [register, i, svd_node.registers]
        } else {
          return findObject(register, path_array, depth + 1)
        }
      }
    }
  }

  if (svd_node.fields) {
    for (var i = 0; i < svd_node.fields.length; ++i) {
      var field = svd_node.fields[i];
      if (field.name === name) {
        if (path_array.length == 0) {
          return [field, i, svd_node.fields]
        } else {
          return findObject(field, path_array, depth + 1)
        }
      }
    }
  }
  return [null]
}


// Compare trees and update. 
// Only qemuAlignment and qemuGroupName are processed.

var compareAndUpdate = function (patch_node, svd_node, depth = 0) {

  if (patch_node.qemuAlignment && !svd_node.qemuAlignment) {
    svd_node.qemuAlignment = patch_node.qemuAlignment
    ctx.console.log(`- qemuAlignment: '${patch_node.qemuAlignment}' added to ${patch_node.name}`)
  }

  if (patch_node.qemuGroupName && !svd_node.qemuGroupName) {
    svd_node.qemuGroupName = patch_node.qemuGroupName
    ctx.console.log(`- qemuGroupName: '${patch_node.qemuGroupName}' added to ${patch_node.name}`)
  }

  if (patch_node.peripherals) {
    if (svd_node.peripherals) {
      // Search peripherals
      var peripherals = patch_node.peripherals
      for (var i = 0; i < peripherals.length; ++i) {
        var peripheral = peripherals[i];
        var periph_name = peripheral.name
        if (periph_name) {
          var svd_periph = svd_node.peripherals.find(periph => { return periph.name === periph_name })
          if (svd_periph) {
            compareAndUpdate(peripheral, svd_periph, depth + 1)
          }
        } else {
          ctx.console.log(`* peripheral node has no name.`)
        }
      }
    } else {
      ctx.console.log(`* node ${patch_node.name} has no peripherals.`)
    }
  }

  if (patch_node.registers) {
    if (svd_node.registers) {
      // Search peripherals
      var registers = patch_node.registers
      for (var i = 0; i < registers.length; ++i) {
        var register = registers[i];
        var register_name = register.name
        if (register_name) {
          var svd_register = svd_node.registers.find(register => { return register.name === register_name })
          if (svd_register) {
            compareAndUpdate(register, svd_register, depth + 1)
          }
        } else {
          ctx.console.log(`* register node has no name.`)
        }
      }
    } else {
      ctx.console.log(`* node ${patch_node.name} has no registers.`)
    }
  }

}
