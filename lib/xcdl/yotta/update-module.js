/*
 * This file is part of the XCDL distribution 
 *   (http://xcdl.github.io).
 * Copyright (c) 2015 Liviu Ionescu.
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

// The module returns an object, with a method run().
// All other vars are local to this module.
var updateModule = {}
module.exports = updateModule

// --------------------------------------------------------------------------  

var inputPdsc

// --------------------------------------------------------------------------  

updateModule.run = function (context, args, callback) {

  if (args.length < 1) {
    context.console.log('Usage:')
    context.console.log('  xcdl-js update-module')

    callback(null)
    return
  }

  context.console.log('Generate module.json from xpack.pdsc.')

  createModule(context)
  createIgnore(context)

  callback(null)
}

// ----------------------------------------------------------------------------

var createModule = function (context) {

  var fs = require('fs')

  var contents = fs.readFileSync('xpack.json')
  var xpack = JSON.parse(contents)

  context.console.log(xpack)

  var module = {}

  module.name = xpack.name
  module.description = xpack.description
  module.version = xpack.version

  module.keywords = xpack.keywords
  if (module.keywords.indexOf('xpack') === -1) {
    module.keywords.push('xpack')
  }
  if (module.keywords.indexOf('xcdl') === -1) {
    module.keywords.push('xcdl')
  }

  var extraIncludes = computeExtraInclude(xpack.name)
  if (extraIncludes) {
    module.extraIncludes = extraIncludes
  }

  var author = xpack.maintainers[0].name + ' <' + xpack.maintainers[0].email
    + '>'
  module.author = author

  module.homepage = xpack.homepage
  module.repository = {}
  module.repository.type = xpack.repository.type
  module.repository.url = xpack.repository.url

  module.bugs = {}
  module.bugs.url = xpack.support[0].url
  module.license = xpack.license

  module.dependencies = {}

  context.console.log(module)

  var json = JSON.stringify(module, null, '\t')

  fs.writeFileSync('module.json', json, 'utf8')
  context.console.log("'module.json' written.")

  return module
}

var computeExtraInclude = function (name) {
  // TODO: scan .xcdl.json files for includeFolder definitions
  // if (name === 'ilg-arm-cmsis') {
  // return [ 'CMSIS/Include', 'CMSIS/Driver/Include' ]
  // }
  return null
}

var createIgnore = function (context) {

  var fs = require('fs')

  var contents = fs.readFileSync('.gitignore')
  context.console.log("'.gitignore' read.")
  var lines = []
  var lines1 = contents.toString().split('\n')
  for (i in lines1) {
    var str = lines1[i].trim()
    if (str.length > 0) {
      lines.push(str)
    }
  }

  contents = fs.readFileSync('.xpack_ignore')
  context.console.log("'.xpack_ignoree' read.")
  var lines2 = contents.toString().split('\n')
  for (i in lines2) {
    var str = lines2[i].trim()
    if (str.length > 0) {
      if (lines.indexOf(str) === -1) {
        lines.push(str)
      }
    }
  }

  lines.sort()
  // context.console.log(lines)

  var out = lines.join('\n')
  out += '\n'
  context.console.log(out)

  fs.writeFileSync('.yotta_ignore', out, 'utf8')
  context.console.log("'.yotta_ignore' written.")
}
// ----------------------------------------------------------------------------
