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

// This script is loaded for `require('xcdl')` and acts as a 
// library that can be included in other modules.

// --------------------------------------------------------------------------  
// Dependencies.  
const log = require('npmlog')
const path = require('path')
const fs = require('fs')

// --------------------------------------------------------------------------  

// The module returns an object, with the following methods:
// - isInterractive(argv, cmd)
// - completer(linePartial, callback)
// - run(cmdLine, context, filename, callback)
// All other vars are local to this module.

var xcdl = {}
module.exports = xcdl

xcdl.name = 'xcdl'

// ----------------------------------------------------------------------------

xcdl.commands = []

// Statically define one command.
xcdl.commands["update-module"] = function (context, args, callback) {
  var impl = require('./xcdl/yotta/update-module.js')

  impl.run(context, args, callback)
};

xcdl.commands["pdsc-convert"] = function (context, args, callback) {
  var impl = require('./xcdl/pdsc/convert.js')

  impl.run(context, args, callback)
};

xcdl.commands["svd-convert"] = function (context, args, callback) {
  var impl = require('./xcdl/svd/convert.js')

  impl.run(context, args, callback)
};

xcdl.commands["svd-patch"] = function (context, args, callback) {
  var impl = require('./xcdl/svd/patch.js')

  impl.run(context, args, callback)
};


xcdl.commands["update-readme"] = function (context, args, callback) {
  var impl = require('./xcdl/pack/update-readme.js')

  impl.run(context, args, callback)
};

// ----------------------------------------------------------------------------

xcdl.isInterractive = function isInterractive(argv, cmd) {
  // TODO elaborate
  if (argv.length > 2) {
    return false
  } else {
    return true
  }
}

// TODO must return an array with 2 entries
// - an array with matching entries for the completion
// - the substring that was used for the matching
xcdl.completer = function replCompleter(linePartial, callback) {

  // callback(null, [['babu', 'riba'], linePartial])

  // If no completion available, return error (an empty string does it too).
  // callback(null, [[''], linePartial])
  return callback(new Error('no completion'))
}

// @param cmdLine is a string with the entire command line
// @param context is either something very complicated, or a simple object
//  created via `vm.createContext()`.
// @param filename comes as 'repl' or null

// The context **must** include:
// - console

// The console may optionally include:
// - cmdName (default: 'xcdl')
// - processArgv (default: parse cmdLine)

xcdl.run = function replEvaluator(cmdLine, context, filename, callback) {

  const startTime = new Date();

  const cmdName = context.cmdName || 'xcdl'
  const cmd2 = cmdLine.trim()
  log.info(`cmd: ${cmd2}`)
  log.verbose(`filename: ${filename}`)
  // TODO: parse, colapse spaces, consider quotes & ampersants
  const args = context.processArgv || cmd2.split(' ')
  args.forEach((val, index) => {
    log.verbose(`${index}: '${val}'`);
  })

  // Compute the package path from this file folder.  
  const packagePath = path.dirname(__dirname)
  const packageJsonPath = packagePath + '/package.json'
  log.verbose(`package.json: ${packageJsonPath}`)
  var packageJsonData
  try {
    // TODO: make async
    packageJsonData = fs.readFileSync(packageJsonPath, 'utf8')
  } catch (err) {
    console.log(err.message)
    return callback(err)
  }

  context.packagePath = packagePath
  context.packageJson = JSON.parse(packageJsonData)

  if (args[0] === '--version') {
    console.log(context.packageJson.version)
    return callback(null)
  }

  if (typeof xcdl.commands[args[0]] === 'function') {

    // Execute the specific command.
    // TODO: make it async.
    xcdl.commands[args[0]](context, args, (err, data) => {

      if (err) {
        return callback(err)
      }
      const endTime = new Date()
      const deltaMillis = endTime - startTime
      log.info('done in ' + deltaMillis + ' ms.')

      return callback(null)
    })


  } else {
    let msg = `Command '${args.join(' ')}' not implemented.`

    // Although REPL insists on displaying the stack trace
    // our event handler nullify the stack, so now errors can 
    // be properly returned as errors.    
    return callback(new Error(`${msg}`))
  }
}

// ----------------------------------------------------------------------------
