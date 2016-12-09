#!/usr/bin/env node

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

// When installed globally, several links from system locations
// (like /usr/local/bin/xcdl, /usr/local/bin/xpack)
// are created to point to this script, so this script may be
// invoked with different names.

// Wrapper in case we're in module_context mode.
// Prevent the '(' being interpreted as a function call,
// define an anonymous function and execute it.
; (function xcdlCli() {

  'use strict'

  // --------------------------------------------------------------------------  
  // Dependencies.  
  const avoider = require('wscript-avoider')
  const path = require('path')
  const vm = require('vm')

  const xcdl = require('../lib/xcdl.js')

  // Conditional dependencies (listed here for completeness).
  // const repl = require('repl')

  // --------------------------------------------------------------------------    
  // Application name.  
  const appName = 'xcdl'

  // Avoid running on WScript.
  avoider.quit_if_wscript(appName)

  // Replace 'node' with the application name, to help `ps` show
  // a more accurate situation.
  process.title = appName

  const log = require('npmlog')
  log.pause() // will be unpaused after config is loaded.
  log.disableColor()

  log.info('it worked if it ends with', 'ok')
  log.info(`argv0: ${process.argv[1]}`)


  // argv[0] = '/usr/local/bin/node'
  // argv[1] = '/.../xcdl-js.git/bin/xcdl-cli.js' or '/.../bin/xpack'
  // Skip the first two strings and keep only the specific ones.
  let args = process.argv.slice(2)

  // Also used as prompt in interractive mode.  
  let cmd = path.basename(process.argv[1])

  if (cmd === 'xpack') {
    // Transform 'xpack a b c' -> 'xcdl pack a b c'
    args.unshift('pack')
  } else if (cmd === 'xrepo') {
    // Transform 'xrepo a b c' -> 'xcdl repo a b c'
    args.unshift('repo')
  } else {
    cmd = 'xcdl'
  }

  log.level = 'verbose'
  log.resume()

  if (!xcdl.isInterractive(process.argv, cmd)) {
    // Batch mode (single shot invocation).

    let ctx = vm.createContext()

    // This is the only mandatory field in the context, so far.    
    ctx.console = console

    // The actual command name is passed via a custom context field.
    ctx.cmdName = cmd

    // The process arguments are passed via a custom context field.
    ctx.processArgv = args

    // ctx.isBatch = true

    let cmdLine = args.join(' ')
    let filename = null

    // Call the runner using the same API as when comming from REPL.
    xcdl.run(cmdLine, ctx, filename, (err, data) => {
      if (err) {
        // Display a single line message.
        // No concerns with the stack trace (yet).
        console.log(err.message)
        return
      }
    })

  } else {
    // Interractive mode.

    const errorCallback = function errorCallback(err) {
      // if (!(err instanceof SyntaxError)) {
      // System errors deserve their stack trace.
      if (!(err instanceof EvalError) && !(err instanceof SyntaxError) && !(err instanceof RangeError) && !(err instanceof ReferenceError) && !(err instanceof TypeError) && !(err instanceof URIError)) {
        // For regular errors it makes no sense to display the stack trace.
        err.stack = null
        // The error message will be displayed shortly, in the next handler,
        // registered by the REPL server.
      }
    }

    const domain = require('domain').create();
    domain.on('error', errorCallback)

    const repl = require('repl')
    const replServer = repl.start(
      {
        prompt: cmd + '> '
        , eval: xcdl.run
        , completer: xcdl.completer
        , domain: domain
      })

    // ------------------------------------------------------------------------
    // Debug only, to test if everything goes to the correct stream.

    const net = require('net')
    var connections = 0

    const domainSock = require('domain').create();
    domainSock.on('error', errorCallback)

    net.createServer((socket) => {
      connections += 1;
      repl.start({
        prompt: cmd + '> '
        , input: socket
        , output: socket
        , eval: xcdl.run
        , completer: xcdl.completer
        , domain: domainSock
      }).on('exit', () => {
        console.log('socket exit')
        socket.end()
      })
    }).listen(5001)
  }

} ())
