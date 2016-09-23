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


// Normally it should be asynchronous, but we're not yet there.

var xcdl = {}
module.exports = xcdl

xcdl.name = 'xcdl'

const log = require('npmlog')

xcdl.commands = []

// Statically define one command.
xcdl.commands["update-module"] = function (args) {
  var impl = require('./xcdl/yotta/update-module.js')

  impl.run(args)
};

xcdl.commands["generate-xpdsc"] = function (args) {
  var impl = require('./xcdl/pack/generate-xpdsc.js')

  impl.run(args)
};

xcdl.commands["update-readme"] = function (args) {
  var impl = require('./xcdl/pack/update-readme.js')

  impl.run(args)
};

xcdl.isOneShot = function isOneShot(argv, cmd) {
  // TODO elaborate
  if (argv.length > 2) {
    return true
  } else {
    return false
  }
}

// TODO must return an array with 2 entries
// - an array with matching entries for the completion
// - the substring that was used for the matching
xcdl.completer = function replCompleter(linePartial, callback) {

  // callback(null, [['babu', 'riba'], linePartial])

  // If no completion available, return error (an empty string does it too).
  // callback(null, [[''], linePartial])
  callback (new Error('no completion'))
}

// @param cmdLine is a string with the entire command line
// @param context is either something very complicated, or a simple object
// created vrom v8.
// @param filename comes as 'repl' or null

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

  if (typeof xcdl.commands[args[0]] === 'function') {

    // Execute the specific command.
    // TODO: make it async.
    xcdl.commands[args[0]](args)

    const endTime = new Date();
    const deltaMillis = endTime - startTime;
    log.info('done in ' + deltaMillis + ' ms.');

    callback(null)
  } else {
    let msg = `Command '${args.join(' ')}' not implemented.`

    if (context.isBatch) {
      callback(new Error(msg))
    } else {
      context.console.error(`Error: ${msg}`)
      callback(null)
    }
  }

}


