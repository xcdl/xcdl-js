#!/usr/bin/env node

(function () { // wrapper in case we're in module_context mode

    app_name = 'xcdl';

    // On Windows: running 'xcdl blah' in this folder will invoke WSH, not node.
    var wsa = require('wscript-avoider')
    wsa.quit_if_wscript(app_name)

    process.title = app_name;
    var app = require('../lib/main.js')

    app.run(process.argv.slice(2))

}());
