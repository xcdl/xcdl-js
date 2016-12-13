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
const xml2js = require('xml2js')
const path = require('path')

const generateX = require('../utils/generate-x.js')

// --------------------------------------------------------------------------  

// The module returns an object, with a method run().
// All other vars are local to this module.
var generateXsvc = {}
module.exports = generateXsvc

// --------------------------------------------------------------------------  

var inputSvd

// --------------------------------------------------------------------------  

generateXsvc.run = function (context, args, callback) {

  if (args.length < 5) {
    context.console.log('Usage:')
    context.console.log('  xcdl generate-xsvd -i svd -o json')

    callback(null)
    return
  }

  context.console.log('Generate xsvd.json from CMSIS .svd.')

  var inputPath
  var outputPath
  var i
  for (i = 1; i < args.length; ++i) {
    if (args[i] === '--ifile' || args[i] === '-i') {
      inputPath = args[i + 1]
      ++i
    } else if (args[i] === '--ofile' || args[i] === '-o') {
      outputPath = args[i + 1]
      ++i
    }
  }

  if (!inputPath || !outputPath) {
    context.console.log('Mandatory input or output path missing.')
       return callback(err) 
  }

  inputSvd = path.basename(inputPath)
  try {
    var inputData = fs.readFileSync(inputPath, 'utf8')
  } catch (err) {
    // context.console.log(er.message)
    return callback(err)
  }
  context.console.log("'" + inputPath + "' read.")

  var parser = new xml2js.Parser()
  parser.parseString(inputData.substring(0, inputData.length), function (err,
    result) {

    var out = createRoot(result)

    generateX.addGenerator(out, 'xcdl', args)
    
    var json = JSON.stringify(out, null, '\t')

    var dirPath = path.dirname(outputPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
    fs.writeFileSync(outputPath, json, 'utf8')
    context.console.log("'" + outputPath + "' written.")

    return callback(null)
  })
}

// ----------------------------------------------------------------------------

// This version processes CMSIS-SVD v1.3.3 files
// http://www.keil.com/pack/doc/CMSIS/SVD/html/svd_Format_pg.html

var createRoot = function (cnode) {

  // Used for development, to see the initial xml2json tree  
  // return cnode  
  var node = {}

  node.warning = 'DO NOT EDIT! Automatically generated from ' + inputSvd
  var generators = []
  node.generators = generators

  node.device = createDevice(cnode.device)

  return node
}

var createDevice = function (cnode) {

  var device = {}

  if (cnode.$) {
    device.xml = cnode.$
  }

  if (cnode.vendor) {
    device.vendor = cnode.vendor[0]
  }
  if (cnode.vendorID) {
    device.vendorID = cnode.vendorID[0]
  }
  if (cnode.series) {
    device.series = cnode.series[0]
  }
  device.name = cnode.name[0]
  device.version = cnode.version[0]
  device.description = filterDescription(cnode.description[0])

  if (cnode.licenseText) {
    device.licenseText = cnode.licenseText[0]
  }

  if (cnode.cpu) {
    device.cpu = createCpu(cnode.cpu[0])
  }

  if (cnode.headerSystemFilename) {
    device.headerSystemFilename = cnode.headerSystemFilename[0]
  }

  if (cnode.headerDefinitionsPrefix) {
    device.headerDefinitionsPrefix = cnode.headerDefinitionsPrefix[0]
  }

  device.addressUnitBits = cnode.addressUnitBits[0]
  device.width = cnode.width[0]

  createPropertiesGroup(device, cnode)

  device.peripherals = generateX.iterateArray(cnode.peripherals[0].peripheral, createPeripheral)

  return device
}

var createCpu = function (cnode) {

  var cpu = {}

  cpu.name = cnode.name[0]
  cpu.revision = cnode.revision[0]
  cpu.endian = cnode.endian[0]
  cpu.mpuPresent = cnode.mpuPresent[0]
  cpu.fpuPresent = cnode.fpuPresent[0]

  if (cnode.fpuDP) {
    cpu.fpuDP = cnode.fpuDP[0]
  }

  if (cnode.icachePresent) {
    cpu.icachePresent = cnode.icachePresent[0]
  }

  if (cnode.dcachePresent) {
    cpu.dcachePresent = cnode.dcachePresent[0]
  }

  if (cnode.itcmPresent) {
    cpu.itcmPresent = cnode.itcmPresent[0]
  }

  if (cnode.dtcmPresent) {
    cpu.dtcmPresent = cnode.dtcmPresent[0]
  }

  if (cnode.vtorPresent) {
    cpu.vtorPresent = cnode.vtorPresent[0]
  }

  if (cnode.nvicPrioBits) {
    cpu.nvicPrioBits = cnode.nvicPrioBits[0]
  }

  if (cnode.vendorSystickConfig) {
    cpu.vendorSystickConfig = cnode.vendorSystickConfig[0]
  }

  if (cnode.deviceNumInterrupts) {
    cpu.deviceNumInterrupts = cnode.deviceNumInterrupts[0]
  }

  if (cnode.sauNumRegions) {
    cpu.sauNumRegions = cnode.sauNumRegions[0]
  }

  if (cnode.sauRegionsConfig) {
    cpu.sauRegionsConfig = createRegionsConfig(cnode.sauRegionsConfig[0])
  }

  return cpu
}

var createRegionsConfig = function (cnode) {

  var regionsConfig

  if (cnode.$) {
    if (cnode.$.enabled) {
      regionsConfig.enabled = cnode.$.enabled[0]
    }
    if (cnode.$.protectionWhenDisabled) {
      regionsConfig.protectionWhenDisabled = cnode.$.protectionWhenDisabled[0]
    }
  }

  if (cnode.region) {
    regionsConfig.regions = generateX.iterateArray(cnode.region, createRegion)
  }
  return regionsConfig
}

var createRegion = function (cnode) {

  var region = {}

  if (cnode.$) {
    if (cnode.$.enabled) {
      region.enabled = cnode.$.enabled[0]
    }
    if (cnode.$.name) {
      region.name = cnode.$.name[0]
    }
  }

  region.base = cnode.base[0]
  region.limit = cnode.limit[0]
  region.access = cnode.access[0]

  return region
}

var createPropertiesGroup = function (outnode, cnode) {

  if (cnode.size) {
    outnode.size = cnode.size[0]
  }
  if (cnode.access) {
    outnode.access = cnode.access[0]
  }
  if (cnode.protection) {
    outnode.protection = cnode.protection[0]
  }
  if (cnode.resetValue) {
    outnode.resetValue = cnode.resetValue[0]
  }
  if (cnode.resetMask) {
    outnode.resetMask = cnode.resetMask[0]
  }
}

var createPeripheral = function (cnode) {

  var peripheral = {}

  peripheral.name = cnode.name[0]

  if (cnode.$) {
    if (cnode.$.derivedFrom) {
      peripheral.derivedFrom = cnode.$.derivedFrom
    }
  }

  if (cnode.version) {
    peripheral.version = cnode.version[0]
  }

  if (cnode.description) {
    peripheral.description = filterDescription(cnode.description[0])
  }

  if (cnode.alternatePeripheral) {
    peripheral.alternatePeripheral = cnode.alternatePeripheral[0]
  }

  if (cnode.groupName) {
    peripheral.groupName = cnode.groupName[0]
  }

  if (cnode.prependToName) {
    peripheral.prependToName = cnode.prependToName[0]
  }

  if (cnode.appendToName) {
    peripheral.appendToName = cnode.appendToName[0]
  }

  if (cnode.headerStructName) {
    peripheral.headerStructName = cnode.headerStructName[0]
  }

  if (cnode.disableCondition) {
    peripheral.disableCondition = cnode.disableCondition[0]
  }

  if (cnode.baseAddress) {
    peripheral.baseAddress = cnode.baseAddress[0]
  }

  createPropertiesGroup(peripheral, cnode)

  createDimElementGroup(peripheral, cnode)

  if (cnode.addressBlock) {
    // Plural
    peripheral.addressBlocks = generateX.iterateArray(cnode.addressBlock, createAddressBlock)
  }

  if (cnode.interrupt) {
    // Plural
    peripheral.interrupts = generateX.iterateArray(cnode.interrupt, createInterrupt)
  }

  if (cnode.registers) {

    if (cnode.registers[0].register) {
      peripheral.registers = generateX.iterateArray(cnode.registers[0].register, createRegister)
    } else if (cnode.registers[0].cluster) {
      peripheral.clusters = generateX.iterateArray(cnode.registers[0].cluster, createCluster)
    }
  }

  return peripheral
}

var createDimElementGroup = function (outnode, cnode) {

  if (outnode.dim) {
    outnode.dim = cnode.dim[0]
    outnode.dimIncrement = cnode.dimIncrement[0]

    if (cnode.dimIndex) {
      outnode.dimIndex = cnode.dimIndex[0]
    }
    if (cnode.dimName) {
      outnode.dimName = cnode.dimName[0]
    }
    if (cnode.resetValue) {
      outnode.resetValue = cnode.resetValue[0]
    }
    if (cnode.resetMask) {
      outnode.resetMask = cnode.resetMask[0]
    }

    if (cnode.dimArrayIndex) {
      outname.dimArrayIndex = createDimArrayIndex(node.dimArrayIndex[0])
    }
  }
}

var createDimArrayIndex = function (cnode) {

  var dimArrayIndex = {}

  if (cnode.headerEnumName) {
    dimArrayIndex.headerEnumName = cnode.headerEnumName[0]
  }

  // Plural  
  dimArrayIndex.enumeratedValues = generateX.iterateArray(cnode.enumeratedValue, createEnumeratedValue)

  return dimArrayIndex
}

var createEnumeratedValue = function (cnode) {

  var enumeratedValue = {}

  if (cnode.name) {
    enumeratedValue.name = cnode.name[0]
  }

  if (cnode.description) {
    enumeratedValue.description = filterDescription(cnode.description[0])
  }

  if (cnode.value) {
    enumeratedValue.value = cnode.value[0]
  } if (cnode.isDefault) {
    enumeratedValue.isDefault = cnode.isDefault[0]
  }

  return enumeratedValue
}

var createRegister = function (cnode) {

  var register = {}

  register.name = cnode.name[0]

  if (cnode.$ && cnode.$.derivedFrom) {
    register.derivedFrom = cnode.$.derivedFrom
  }

  if (cnode.displayName) {
    register.displayName = cnode.displayName[0]
  }

  if (cnode.description) {
    register.description = filterDescription(cnode.description[0])
  }

  if (cnode.alternateGroup) {
    register.alternateCluster = cnode.alternateGroup[0]
  }

  if (cnode.alternateRegister) {
    register.headerStructName = cnode.alternateRegister[0]
  }

  register.addressOffset = cnode.addressOffset[0]

  createPropertiesGroup(register, cnode)

  if (cnode.dataType) {
    register.dataType = cnode.dataType[0]
  }

  if (cnode.modifiedWriteValues) {
    register.modifiedWriteValues = cnode.modifiedWriteValues[0]
  }

  if (cnode.writeConstraint) {
    register.writeConstraint = cnode.writeConstraint[0]
  }

  if (cnode.readAction) {
    register.readAction = cnode.readAction[0]
  }

  if (cnode.fields) {
    register.fields = generateX.iterateArray(cnode.fields[0].field, createField)
  }

  return register
}

var createInterrupt = function (cnode) {

  var interrupt = {}

  interrupt.name = cnode.name[0]

  if (cnode.description) {
    interrupt.description = filterDescription(cnode.description[0])
  }

  interrupt.value = cnode.value[0]

  return interrupt
}

var createAddressBlock = function (cnode) {

  var addressBlock = {}

  addressBlock.offset = cnode.offset[0]
  addressBlock.size = cnode.size[0]
  addressBlock.usage = cnode.usage[0]

  if (addressBlock.protection) {
    addressBlock.protection = cnode.protection[0]
  }

  return addressBlock
}

var createCluster = function (cnode) {

  var cluster = {}

  cluster.name = cnode.name[0]

  if (cnode.$ && cnode.$.derivedFrom) {
    cluster.derivedFrom = cnode.$.derivedFrom
  }

  if (cnode.description) {
    cluster.description = filterDescription(cnode.description[0])
  }

  if (cnode.alternateCluster) {
    cluster.alternateCluster = cnode.alternateCluster[0]
  }

  if (cnode.headerStructName) {
    cluster.headerStructName = cnode.headerStructName[0]
  }

  cluster.addressOffset = cnode.addressOffset[0]

  createPropertiesGroup(cluster, cnode)

  createDimElementGroup(cluster, cnode)


  if (cnode.cluster) {
    cluster.clusters = generateX.iterateArray(cnode.cluster, createCluster)
  }

  if (cnode.register) {
    cluster.registers = generateX.iterateArray(cnode.register, createRegister)
  }

  return cluster;
}

var createField = function (cnode) {

  var field = {}

  field.name = cnode.name[0]

  if (cnode.$ && cnode.$.derivedFrom) {
    field.derivedFrom = cnode.$.derivedFrom
  }

  if (cnode.description) {
    field.description = filterDescription(cnode.description[0])
  }

  if (cnode.bitOffset) {
    field.bitOffset = cnode.bitOffset[0]

    if (cnode.bitWidth) {
      field.bitWidth = cnode.bitWidth[0]
    }
  } else if (cnode.lsb && cnode.msb) {
    // Deviate slightly from the policy of non-intervention,
    // Convert these to offset & width
    var lsb = parseInt(cnode.lsb[0], 10)
    var msb = parseInt(cnode.msb[0], 10)
    field.bitOffset = cnode.lsb[0]
    field.bitWidth = String(msb - lsb + 1)
  } else if (cnode.bitRange) {
    field.bitRange = cnode.bitRange
  }

  if (cnode.access) {
    field.access = cnode.access[0]
  }

  if (cnode.modifiedWriteValues) {
    field.modifiedWriteValues = cnode.modifiedWriteValues[0]
  }

  if (cnode.writeConstraint) {
    field.writeConstraint = cnode.writeConstraint[0]
  }

  if (cnode.readAction) {
    field.readAction = cnode.readAction[0]
  }

  if (cnode.enumeratedValues) {
    field.enumeration = createEnumeratedValuesObject(cnode.enumeratedValues[0])
  }

  return field
}

var createEnumeratedValuesObject = function (cnode) {

  var enumeratedValuesObject = {}

  if (cnode.name) {
    enumeratedValuesObject.name = cnode.name[0]
  }

  if (cnode.usage) {
    enumeratedValuesObject.usage = cnode.usage[0]
  }

  enumeratedValuesObject.enumeratedValues = generateX.iterateArray(cnode.enumeratedValue, createEnumeratedValue)

  return enumeratedValuesObject
}

// ----------------------------------------------------------------------------

var filterDescription = function (str) {

  if (!str) {
    return undefined
  }

  str = str.replace(/\r\n/g, '\n')

  var arr = str.split('\n')
  if (arr.length > 1) {
    arr.forEach(function (item, index, arr) {
      arr[index] = item.trim()
    })
    str = arr.join(' ')
  } else {
    str = str.trim()
  }

  if (str.length > 1) {
    return str.slice(0, 1).toUpperCase() + str.slice(1)
  } else {
    return str.toUpperCase()
  }
}
