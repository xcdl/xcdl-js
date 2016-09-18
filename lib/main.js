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

(function () {

    debugger;
    var app_name = 'xcdl-js';

    // windows: running 'app blah' in this folder will invoke WSH, not node.
    /* globals WScript */
    if (typeof WScript !== 'undefined') {
        WScript
                .echo(app_name + ' does not work when run\n'
                        + 'with the Windows Scripting Host\n\n'
                        + '"cd" to a different folder,\n' + 'or type "'
                        + app_name + '.cmd <args>",\n' + 'or type "node '
                        + app_name + ' <args>".');
        WScript.quit(1);
        return;
    }

    var app = {};
    module.exports = app;
    app.name = app_name;

    app.commands = {};

    // Statically define one command.
    app.commands["generate-xpdsc"] = function (args) {
        var impl = require('./generate-xpdsc/main.js');

        impl.run(args);
    };

    app.commands["update-module"] = function (args) {
        var impl = require('./update-module/main.js');

        impl.run(args);
    };

    app.commands["update-readme"] = function (args) {
        var impl = require('./update-readme/main.js');

        impl.run(args);
    };

    // This is called from the CLI helper, to dispatch the command.
    app.run = function (args) {
        if (typeof app.commands[args[0]] === "function") {
            return app.commands[args[0]](args);
        } else {
            console.log('Command not implementd ' + args);
            return 1;
        }
    };

}());