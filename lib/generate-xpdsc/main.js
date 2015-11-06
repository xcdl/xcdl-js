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

Generate_XPDSC.prototype.run = function(args, eh) {

  console.log('Generate xpdsc.json!');
  console.log(args);

  var fs = require('fs');
  var xml2js = require('xml2js');

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

  // Assume this returns a fully qualified XML file path
  try {
    var inputData = fs.readFileSync(inputPath, 'utf8');

    console.log("File '" + inputPath + "' was successfully read.");
  } catch (ex) {
    console.log("Unable to read file '" + inputPath + "'.");
    console.log(ex);
  }

  var parser = new xml2js.Parser();
  parser.parseString(inputData.substring(0, inputData.length), function(err,
      result) {

    var out = createRoot(result);
    var json = JSON.stringify(out, null, '\t');

    fs.writeFileSync(outputPath, json, 'utf8');
    console.log("File '" + outputPath + "' was successfully written.");
  });

};

module.exports = new Generate_XPDSC();

// ----------------------------------------------------------------------------

var createRoot = function(cnode) {

  var node = {};

  node.package = createPackage(cnode.package);
  return node;
};

var createPackage = function(cnode) {

  var node = {};

  node.vendor = cnode.vendor[0];
  node.name = cnode.name[0];
  node.description = filterDescription(cnode.description[0]);
  node.version = cnode.releases[0].release[0].$.version;

  if (cnode.devices) {
    node.devices = createDevices(cnode.devices);
  }

  return node;
};

var createDevices = function(cnode) {

  var node = {};
  node.families = createFamilyArray(cnode[0].family);
  return node;
};

var createFamilyArray = function(cnode) {

  nodes = [];
  var i;
  var len = cnode.length;
  for (i = 0; i < len; ++i) {
    var family = cnode[i];

    nodes.push(createFamily(family));
  }

  return nodes;
};

var createFamily = function(cnode) {

  var node = {};

  node.name = cnode.$.Dfamily;
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
    node.debug = createDebug(cnode.debug[0]);
  }

  if (cnode.memory) {
    node.memorySections = createMemoryArray(cnode.memory);
  }

  if (cnode.subFamily) {
    node.subFamilies = createSubFamilyArray(cnode.subFamily);
  }

  if (cnode.device) {
    node.devices = createDeviceArray(cnode.device);
  }

  return node;
};

var createCompile = function(cnode) {

  var node = {};
  node.name = cnode.$.Pname;
  node.header = filterPath(cnode.$.header);
  node.define = cnode.$.define;

  return node;
};

var createProcessor = function(cnode) {

  var node = {};
  node.name = cnode.$.Pname;
  if (cnode.$.Dvendor) {
    node.vendorId = cnode.$.Dvendor.split(':')[1];
    node.vendorName = cnode.$.Dvendor.split(':')[0];
  }
  node.core = cnode.$.Dcore;
  node.coreVersion = cnode.$.DcoreVersion;
  node.fpu = cnode.$.Dfpu;
  node.mpu = cnode.$.Dmpu;
  node.endian = cnode.$.Dendian;
  node.clock = cnode.$.Dclock;

  return node;
};

var createDebug = function(cnode) {

  var node = {};
  node.svdPath = filterPath(cnode.$.svd);

  return node;
};

var createSubFamilyArray = function(cnode) {

  var nodes = [];

  var i;
  var len = cnode.length;
  for (i = 0; i < len; ++i) {
    var subfamily = cnode[i];
    nodes.push(createSubFamily(subfamily));
  }

  return nodes;
}

var createSubFamily = function(cnode) {

  var node = {};
  node.name = cnode.$.DsubFamily;
  node.description = filterDescription(cnode.description);

  if (cnode.processor) {
    node.processor = createProcessor(cnode.processor[0]);
  }

  if (cnode.compile) {
    node.compile = createCompile(cnode.compile[0]);
  }

  if (cnode.debug) {
    node.debug = createDebug(cnode.debug[0]);
  }

  if (cnode.memory) {
    node.memorySections = createMemoryArray(cnode.memory);
  }

  if (cnode.device) {
    node.devices = createDeviceArray(cnode.device);
  }

  return node;
};

var createDeviceArray = function(cnode) {

  var nodes = [];

  var i;
  var len = cnode.length;
  for (i = 0; i < len; ++i) {
    var device = cnode[i];
    nodes.push(createDevice(device));
  }

  return nodes;
};

var createDevice = function(cnode) {

  var node = {};
  node.name = cnode.$.Dname;
  node.description = filterDescription(cnode.description);

  if (cnode.processor) {
    node.processor = createProcessor(cnode.processor[0]);
  }

  if (cnode.compile) {
    node.compile = createCompile(cnode.compile[0]);
  }

  if (cnode.debug) {
    node.debug = createDebug(cnode.debug[0]);
  }

  if (cnode.memory) {
    node.memorySections = createMemoryArray(cnode.memory);
  }

  if (cnode.variant) {
    node.variants = createVariantArray(cnode.variant);
  }

  return node;
};

var createMemoryArray = function(cnode) {

  var nodes = [];

  var i;
  var len = cnode.length;
  for (i = 0; i < len; ++i) {
    var memory = cnode[i];
    nodes.push(createMemory(memory));
  }

  return nodes;
};

var createMemory = function(cnode) {

  var node = {};

  node.pname = cnode.$.pname;
  node.name = cnode.$.name;
  node.id = cnode.$.id;
  node.access = cnode.$.access;
  node.start = cnode.$.start;
  node.size = cnode.$.size;
  node.startup = cnode.$.startup;
  node["default"] = cnode.$["default"];
  node.alias = cnode.$.alias;

  return node;
};

var createVariantArray = function(cnode) {

  var nodes = [];

  var i;
  var len = cnode.length;
  for (i = 0; i < len; ++i) {
    var variant = cnode[i];
    nodes.push(createVariant(variant));
  }

  return nodes;
};

var createVariant = function(cnode) {

  var node = {};
  node.name = cnode.$.Dvariant;
  node.description = filterDescription(cnode.description);

  node.features = [];

  var i;
  var len = cnode.feature.length;
  for (i = 0; i < len; ++i) {
    var feature = cnode.feature[i];
    node.features.push(createFeature(feature));
  }

  return node;
};

var createFeature = function(cnode) {

  var node = {};

  node.type = cnode.$.type;
  node.n = cnode.$.n;

  return node;
};

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
