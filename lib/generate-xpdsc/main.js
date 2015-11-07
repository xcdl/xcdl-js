/* 
 * This file is part of the XCDL distribution (http://xcdl.github.io).
 * Copyright (c) 2015 Liviu Ionescu.
 * 
 * This program is free software: you can redistribute it and/or modify  
 * it under the terms of the GNU General Public License as published by  
 * the Free Software Foundation, version.
 *
 * This program is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License 
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var Generate_XPDSC = function() {
};
var inputPdsc;

Generate_XPDSC.prototype.run = function(args, eh) {

  var startTime = new Date();

  if (args.length < 5) {
    console.log('Usage:');
    console.log('  xcdl-js generate-xpdsc -i pdsc -o json');
    return;
  }

  console.log('Generate xpdsc.json from CMSIS .pdsc.');

  var fs = require('fs');
  var xml2js = require('xml2js');
  var path = require('path')

  var inputPath;
  var outputPath;
  var i;
  for (i = 1; i < args.length; ++i) {
    if (args[i] === '-i') {
      inputPath = args[i + 1];
      ++i;
    } else if (args[i] == '-o') {
      outputPath = args[i + 1];
      ++i;
    }
  }

  inputPdsc = path.basename(inputPath);
  var inputData = fs.readFileSync(inputPath, 'utf8');
  console.log("'" + inputPath + "' read.");

  var parser = new xml2js.Parser();
  parser.parseString(inputData.substring(0, inputData.length), function(err,
      result) {

    var out = createRoot(result);
    var json = JSON.stringify(out, null, '\t');

    fs.writeFileSync(outputPath, json, 'utf8');
    console.log("'" + outputPath + "' written.");
  });
  var endTime = new Date();
  var deltaMillis = endTime - startTime;
  console.log('Done in ' + deltaMillis + ' ms.');

};

module.exports = new Generate_XPDSC();

// ----------------------------------------------------------------------------

// TODO: process trace

var iterateArray = function(cnode, fn) {

  var nodes = [];

  var i;
  var len = cnode.length;
  for (i = 0; i < len; ++i) {
    nodes.push(fn(cnode[i]));
  }

  return nodes;
};

var createRoot = function(cnode) {

  var node = {};

  node.schemaVersion = '1.1';
  node.warning = 'DO NOT EDIT! Automatically generated from ' + inputPdsc;
  node.generators = [ 'xcdl-js generate-xpdsc' ];

  node['package'] = createPackage(cnode['package']);
  return node;
};

var createPackage = function(cnode) {

  var node = {};

  node.vendor = cnode.vendor[0];
  node.name = cnode.name[0];
  node.description = filterDescription(cnode.description[0]);
  node.version = cnode.releases[0].release[0].$.version;
  node.date = cnode.releases[0].release[0].$.date;

  if (cnode.devices) {
    node.devices = iterateArray(cnode.devices[0].family, createFamily);
  }

  if (cnode.boards) {
    node.boards = iterateArray(cnode.boards[0].board, createBoard);
  }

  return node;
};

var createFamily = function(cnode) {

  var node = {};

  node.name = cnode.$.Dfamily;
  node.type = 'family';
  node.description = filterDescription(cnode.description);
  node.vendorId = cnode.$.Dvendor.split(':')[1];
  node.vendorName = cnode.$.Dvendor.split(':')[0];

  if (cnode.processor) {
    node.processor = createProcessor(cnode.processor[0]);
  }

  if (cnode.compile) {
    node.compile = createCompile(cnode.compile[0]);
  }

  if (cnode.debug) {
    node.debugOptions = iterateArray(cnode.debug, createDebug);
  }

  if (cnode.debugconfig) {
    node.debugConfigs = createDebugConfig(cnode.debug[0]);
  }

  if (cnode.debugport) {
    node.debugPorts = iterateArray(cnode.debugport, createDebugPort);
  }

  if (cnode.memory) {
    node.memorySections = iterateArray(cnode.memory, createMemory);
  }

  if (cnode.feature) {
    node.features = iterateArray(cnode.feature, createFeature);
  }

  var children = [];
  if (cnode.subFamily) {
    children = children.concat(iterateArray(cnode.subFamily, createSubFamily));
  }

  if (cnode.device) {
    children = children.concat(iterateArray(cnode.device, createDevice));
  }

  if (children.length > 0) {
    node.children = children;
  }

  return node;
};

var createCompile = function(cnode) {

  var node = {};

  node.Pname = cnode.$.Pname;
  node.header = filterPath(cnode.$.header);
  node.define = cnode.$.define;

  return node;
};

var createProcessor = function(cnode) {

  var node = {};

  node.Pname = cnode.$.Pname;
  if (cnode.$.Dvendor) {
    node.vendorId = cnode.$.Dvendor.split(':')[1];
    node.vendorName = cnode.$.Dvendor.split(':')[0];
  }
  node.core = cnode.$.Dcore;
  node.coreVersion = cnode.$.DcoreVersion;
  if (cnode.$.Dfpu) {
    if (cnode.$.Dfpu === '0') {
      node.fpu = 'NO_FPU';
    } else if (cnode.$.Dfpu === '1') {
      node.fpu = 'FPU';
    } else {
      node.fpu = cnode.$.Dfpu
    }
  }
  if (cnode.$.Dmpu) {
    if (cnode.$.Dmpu === '0') {
      node.mpu = 'NO_MPU';
    } else if (cnode.$.Dmpu === '1') {
      node.mpu = 'MPU';
    } else {
      node.mpu = cnode.$.Dmpu;
    }
  }
  node.endian = cnode.$.Dendian;
  node.clock = cnode.$.Dclock;

  return node;
};

var createDebug = function(cnode) {

  var node = {};

  node.Pname = cnode.$.Pname;
  node.__dp = cnode.$.__dp;
  node.__ap = cnode.$.__ap;
  node.svd = filterPath(cnode.$.svd);

  return node;
};

var createDebugPort = function(cnode) {

  var node = {};

  node.__dp = cnode.$.__dp;

  if (cnode.jtag) {
    node.jtag = {};

    node.jtag.tapindex = cnode.jtag[0].$.tapindex;
    node.jtag.idcode = cnode.jtag[0].$.idcode;
    node.jtag.irlen = cnode.jtag[0].$.irlen;
  }

  if (cnode.swd) {
    node.swd = {};

    node.swd.idcode = cnode.swd[0].$.idcode;
  }

  if (cnode.cjtag) {
    node.cjtag = {};

    node.cjtag.tapindex = cnode.cjtag[0].$.tapindex;
    node.cjtag.idcode = cnode.cjtag[0].$.idcode;
    node.cjtag.irlen = cnode.cjtag[0].$.irlen;
  }

  return node;
};

var createDebugConfig = function(cnode) {

  var node = {};

  node['default'] = cnode.$['default'];
  node.clock = cnode.$.clock;
  node.swj = cnode.$.swj;

  return node;
};

var createSubFamily = function(cnode) {

  var node = {};

  node.name = cnode.$.DsubFamily;
  node.type = 'subfamily';
  node.description = filterDescription(cnode.description);

  if (cnode.processor) {
    node.processor = createProcessor(cnode.processor[0]);
  }

  if (cnode.compile) {
    node.compile = createCompile(cnode.compile[0]);
  }

  if (cnode.debug) {
    node.debugOptions = iterateArray(cnode.debug, createDebug);
  }

  if (cnode.debugconfig) {
    node.debugConfigs = createDebugConfig(cnode.debug[0]);
  }

  if (cnode.debugport) {
    node.debugPorts = iterateArray(cnode.debugport, createDebugPort);
  }

  if (cnode.memory) {
    node.memorySections = iterateArray(cnode.memory, createMemory);
  }

  if (cnode.feature) {
    node.features = iterateArray(cnode.feature, createFeature);
  }

  if (cnode.device) {
    node.children = iterateArray(cnode.device, createDevice);
  }

  return node;
};

var createDevice = function(cnode) {

  var node = {};

  node.name = cnode.$.Dname;
  node.type = 'device';
  node.description = filterDescription(cnode.description);

  if (cnode.processor) {
    node.processor = createProcessor(cnode.processor[0]);
  }

  if (cnode.compile) {
    node.compile = createCompile(cnode.compile[0]);
  }

  if (cnode.debug) {
    node.debugOptions = iterateArray(cnode.debug, createDebug);
  }

  if (cnode.debugconfig) {
    node.debugConfigs = createDebugConfig(cnode.debug[0]);
  }

  if (cnode.debugport) {
    node.debugPorts = iterateArray(cnode.debugport, createDebugPort);
  }

  if (cnode.memory) {
    node.memorySections = iterateArray(cnode.memory, createMemory);
  }

  if (cnode.feature) {
    node.features = iterateArray(cnode.feature, createFeature);
  }

  if (cnode.variant) {
    node.children = iterateArray(cnode.variant, createVariant);
  }

  return node;
};

var createMemory = function(cnode) {

  var node = {};

  node.pname = cnode.$.pname;
  node.name = cnode.$.name;
  node.id = cnode.$.id;
  node.access = cnode.$.access;
  node.start = cnode.$.start;
  node.size = cnode.$.size;
  if (cnode.$.startup === '1') {
    node.startup = true;
  }
  if (cnode.$['default'] === '1') {
    node['default'] = true;
  }
  node.alias = cnode.$.alias;

  return node;
};

var createVariant = function(cnode) {

  var node = {};

  node.name = cnode.$.Dvariant;
  node.type = 'variant';
  node.description = filterDescription(cnode.description);

  if (cnode.feature) {
    node.features = iterateArray(cnode.feature, createFeature);
  }

  return node;
};

var createFeature = function(cnode) {

  var node = {};

  node.Pname = cnode.$.Pname;
  node.name = cnode.$.type;

  switch (cnode.$.type) {
  case 'BGA':
  case 'CSP':
  case 'PLCC':
  case 'QFN':
  case 'QFP':
  case 'SOP':
  case 'DIP':
  case 'PackageOther':
    node.type = 'package'
    break;

  case 'CAN':
  case 'ETH':
  case 'I2C':
  case 'I2S':
  case 'LIN':
  case 'SDIO':
  case 'SPI':
  case 'UART':
  case 'USART':
  case 'USBD':
  case 'USBH':
  case 'USBOTG':
    node.type = 'interface';
    break;

  case 'XTAL':
  case 'IntRC':
  case 'RTC':
    node.type = 'clock';
    break;

  default:
  }

  node.description = filterDescription(cnode.$.name);
  node.n = cnode.$.n;
  node.m = cnode.$.m;

  return node;
};

var createBoard = function(cnode) {

  var node = {};

  node.name = cnode.$.name;
  node.description = filterDescription(cnode.description);
  node.revision = cnode.$.revision;
  node.vendor = cnode.$.vendor;

  if (cnode.mountedDevice) {
    node.mountedDevices = iterateArray(cnode.mountedDevice, createBoardDevice);
  }

  if (cnode.compatibleDevice) {
    node.compatibleDevices = iterateArray(cnode.compatibleDevice,
        createBoardDevice);
  }

  if (cnode.debugInterface) {
    node.debugInterfaces = iterateArray(cnode.debugInterface,
        createBoardDebugInterface);
  }

  if (cnode.feature) {
    node.features = iterateArray(cnode.feature, createBoardFeature);
  }

  return node;
};

var createBoardDevice = function(cnode) {

  var node = {};

  node.deviceIndex = cnode.$.deviceIndex;
  if (cnode.$.Dvendor) {
    node.vendorId = cnode.$.Dvendor.split(':')[1];
    node.vendorName = cnode.$.Dvendor.split(':')[0];
  }
  node.family = cnode.$.Dfamily;
  node.subFamily = cnode.$.DsubFamily;
  node.name = cnode.$.Dname;

  return node;
};

var createBoardDebugInterface = function(cnode) {

  var node = {};

  node.adapter = cnode.$.adapter;
  node.connector = cnode.$.connector;

  return node;
};

var createBoardFeature = function(cnode) {

  var node = {};

  node.name = cnode.$.type;
  node.description = filterDescription(cnode.$.name);
  node.n = cnode.$.n;
  node.m = cnode.$.m;

  return node;
};

// ----------------------------------------------------------------------------

var filterDescription = function(str) {

  if (!str) {
    return undefined;
  }
  if (typeof str === 'object') {
    str = str[0];
  }
  return str.trim().replace(/\r\n/g, '\n');
};

var filterPath = function(str) {
  return str.replace(/\\/g, '/');
};
