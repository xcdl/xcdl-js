#!/usr/bin/env node

(function () { // wrapper in case we're in module_context mode

    app_name = 'xcdl-js';

    // windows: running "xcdl blah" in this folder will invoke WSH, not node.
    /* global WScript */
    if (typeof WScript !== 'undefined') {
        WScript
                .echo(app_name + ' does not work when run\n'
                        + 'with the Windows Scripting Host\n\n'
                        + "'cd' to a different folder,\n" + "or type '"
                        + app_name + ".cmd <args>',\n" + "or type 'node "
                        + app_name + " <args>'.");
        WScript.quit(1);
        return;
    }

    process.title = app_name;
    var app = require('../lib/main.js');

    app.run(process.argv.slice(2));

}());
