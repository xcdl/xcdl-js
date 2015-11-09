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

;
(function () {

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
    app.commands["generate-xpdsc"] = function (args, eh) {
        var impl = require('./generate-xpdsc/main.js');

        impl.run(args, eh);
    };

    // This is called from the CLI helper, to dispatch the command.
    app.run = function (args) {
        if (typeof app.commands[args[0]] === "function") {
            return app.commands[args[0]](args);
        }
    }

})()