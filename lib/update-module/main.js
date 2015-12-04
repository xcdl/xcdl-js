/*
 * This file is part of the XCDL distribution (http://xcdl.github.io).
 * Copyright (c) 2015 Liviu Ionescu.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// The module returns an object, with a method run().
// All other vars are local to this module.
var impl = {};
module.exports = impl;

var inputPdsc;

impl.run = function (args) {

    'use strict';
    var startTime = new Date();

    if (args.length < 1) {
        console.log('Usage:');
        console.log('  xcdl-js update-module');
        return;
    }

    console.log('Generate module.json from xpack.pdsc.');

    createModule();
    createIgnore();

    var endTime = new Date();
    var deltaMillis = endTime - startTime;
    console.log('Done in ' + deltaMillis + ' ms.');
};

// ----------------------------------------------------------------------------

var createModule = function () {

    var fs = require('fs');

    var contents = fs.readFileSync('xpack.json');
    var xpack = JSON.parse(contents);

    console.log(xpack);

    var module = {};

    module.name = xpack.name;
    module.description = xpack.description;
    module.version = xpack.version;

    module.keywords = xpack.keywords;
    if (module.keywords.indexOf('xpack') === -1) {
        module.keywords.push('xpack');
    }
    if (module.keywords.indexOf('xcdl') === -1) {
        module.keywords.push('xcdl');
    }

    var extraIncludes = computeExtraInclude(xpack.name);
    if (extraIncludes) {
        module.extraIncludes = extraIncludes;
    }

    var author = xpack.maintainers[0].name + ' <' + xpack.maintainers[0].email
            + '>';
    module.author = author;

    module.homepage = xpack.homepage;
    module.repository = {};
    module.repository.type = xpack.repository.type;
    module.repository.url = xpack.repository.url;

    module.bugs = {};
    module.bugs.url = xpack.support[0].url;
    module.license = xpack.license;

    module.dependencies = {};

    console.log(module);

    var json = JSON.stringify(module, null, '\t');

    fs.writeFileSync('module.json', json, 'utf8');
    console.log("'module.json' written.");

    return module;
}

var computeExtraInclude = function (name) {
    // TODO: scan .xcdl.json files for includeFolder definitions
    // if (name === 'ilg-arm-cmsis') {
    // return [ 'CMSIS/Include', 'CMSIS/Driver/Include' ];
    // }
    return null;
}

var createIgnore = function () {

    var fs = require('fs');

    var contents = fs.readFileSync('.gitignore');
    console.log("'.gitignore' read.");
    var lines = [];
    var lines1 = contents.toString().split('\n');
    for (i in lines1) {
        var str = lines1[i].trim();
        if (str.length > 0) {
            lines.push(str);
        }
    }

    contents = fs.readFileSync('.xpack_ignore');
    console.log("'.xpack_ignoree' read.");
    var lines2 = contents.toString().split('\n');
    for (i in lines2) {
        var str = lines2[i].trim();
        if (str.length > 0) {
            if (lines.indexOf(str) === -1) {
                lines.push(str);
            }
        }
    }

    lines.sort();
    // console.log(lines);

    var out = lines.join('\n');
    out += '\n';
    console.log(out);

    fs.writeFileSync('.yotta_ignore', out, 'utf8');
    console.log("'.yotta_ignore' written.");
}
// ----------------------------------------------------------------------------
