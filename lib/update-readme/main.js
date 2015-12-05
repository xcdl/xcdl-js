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
        console.log('  xcdl-js update-readme');
        return;
    }

    console.log('Generate README.md from xpack.pdsc.');

    createReadme();

    var endTime = new Date();
    var deltaMillis = endTime - startTime;
    console.log('Done in ' + deltaMillis + ' ms.');
};

// ----------------------------------------------------------------------------

var createReadme = function () {

    var fs = require('fs');

    var contents = fs.readFileSync('xpack.json');
    var xpack = JSON.parse(contents);

    // console.log(xpack);

    var md = "";

    var title = xpack.title || xpack.name;
    md += '# ' + title + '\n';
    md += '\n';
    var description = xpack.description;
    md += description + '\n';
    md += '\n';

    var yotta_repo = 'http://yotta.mbed.com/#/module/' + xpack.name + '/'
            + xpack.version;

    md += '## Package\n';
    md += '\n';
    md += '[' + xpack.title + '](' + xpack.homepage + ') package details:\n'
    md += '\n';
    md += '* type: [xcdl](http://xcdl.github.io)\n';
    md += '* yotta name: `' + xpack.name + '`\n';
    md += '* yotta repo: ' + yotta_repo + '\n';
    md += '* ' + xpack.repository.type + ' repo: ' + xpack.repository.url
            + '\n';
    md += '* homepage: ' + xpack.homepage + '\n';
    md += '* latest archive: ' + xpack.repository.archive + '\n';
    md += '\n';

    md += '## Version\n';
    md += '\n';
    md += '* ' + xpack.version + '\n';
    md += '\n';

    md += '## Releases\n';
    var releases = xpack.releases;
    if (releases && releases.length > 0) {
        md += '\n';
        for (var i = 0; i < releases.length; ++i) {
            md += '### ' + releases[i].version;
            if (releases[i].date) {
                md += ' / ' + releases[i].date;
            }
            md += '\n';
            md += releases[i].description + '\n';
            md += '\n';
            if (releases[i].archives && releases[i].archives.length > 0) {
                md += 'Archives: \n';
                md += '\n';
                for (var j = 0; j < releases[i].archives.length; ++j) {
                    md += '* ' + releases[i].archives[j] + '\n';
                }
                md += '\n';
            }
        }
    } else {
        md += '\n';
        md += '* none\n';
    }
    md += '\n';

    md += '## Package maintainers\n';
    md += createPersonsList(xpack.maintainers);

    md += '## Content contributors\n';
    md += createPersonsList(xpack.contributors);

    md += '## Support\n';
    var support = xpack.support;
    if (support && support.length > 0) {
        md += '\n';
        for (var i = 0; i < support.length; ++i) {
            md += '* [' + support[i].description + '](' + support[i].url
                    + ')\n';
        }
    } else {
        md += '\n';
        md += '* none\n';
    }
    md += '\n';

    md += '## Dependencies\n';
    var dependencies = xpack.dependencies;
    if (dependencies && dependencies.length > 0) {
        md += '\n';
        for (var i = 0; i < dependencies.length; ++i) {
            md += '* ' + dependencies[i].name + ' ' + dependencies[i].version
                    + '\n';
        }
    } else {
        md += '\n';
        md += '* none\n';
    }
    md += '\n';

    md += '## Keywords\n';
    var keywords = xpack.keywords;
    if (keywords && keywords.length > 0) {
        md += '\n';
        for (var i = 0; i < keywords.length; ++i) {
            md += '* ' + keywords[i] + '\n';
        }
    } else {
        md += '\n';
        md += '* none\n';
    }
    md += '\n';

    md += '## License\n';
    var license = xpack.license;
    if (license) {
        md += '\n';
        if (license.startsWith('LicenseRef-')) {
            var file_ref = license.substr('LicenseRef-'.length);
            md += '* custom, see `' + file_ref + '` in package root\n';

            console.log('LicenseRef');
        } else {
            md += '* [spdx](http://spdx.org/licenses/): ' + license + '\n';
        }
    } else {
        md += '\n';
        md += '* none\n';
    }
    md += '\n';

    try {
        var notes = fs.readFileSync('NOTES.md');
        md += '--- \n';
        md += notes;
        md += '\n';
    } catch (err) {
        console.log(err.message);
    }
    md += '--- \n';

    console.log(md);

    fs.writeFileSync('README.md', md, 'utf8');
    console.log("'README.md' written.");

    return module;
}

var createPersonsList = function (persons) {
    var md = "";

    if (persons && persons.length > 0) {
        md += '\n';
        for (var i = 0; i < persons.length; ++i) {
            var url = persons[i].url;
            if (url) {
                md += '* [' + persons[i].name + '](' + url + ')';
            } else {
                md += '* ' + persons[i].name;
            }
            if (persons[i].email) {
                md += ' [&lt;' + persons[i].email + '&gt;](mailto:'
                        + persons[i].email + ')';
            }
            md += '\n';
        }
    } else {
        md += '\n';
        md += '* none\n';
    }
    md += '\n';

    return md;
}

// ----------------------------------------------------------------------------
