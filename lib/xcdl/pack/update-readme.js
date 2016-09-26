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
// Dependencies.  
var fs = require('fs')

// The module returns an object, with a method run().
// All other vars are local to this module.
var updateReadme = {}
module.exports = updateReadme

// --------------------------------------------------------------------------  

var inputPdsc

updateReadme.run = function (context, args, callback) {

  if (args.length < 1) {
    context.console.log('Usage:')
    context.console.log('  xcdl-js update-readme')

    return callback(null)
  }

  context.console.log('Generate README.md from xpack.pdsc.')

  createReadme(context)

  return callback(null)
}

// ----------------------------------------------------------------------------

var createReadme = function (context) {

  var fs = require('fs')

  var contents = fs.readFileSync('xpack.json')
  var xpack = JSON.parse(contents)

  // context.console.log(xpack)

  var md = ""

  var title = xpack.title || xpack.name
  md += '# ' + title + '\n'
  md += '\n'
  var description = xpack.description
  md += description + '\n'
  md += '\n'

  var yotta_repo = 'http://yotta.mbed.com/#/module/' + xpack.name + '/'
    + xpack.version

  md += '## Package\n'
  md += '\n'
  md += '[' + xpack.title + '](' + xpack.homepage + ') package details:\n'
  md += '\n'
  md += '* type: [xcdl](http://xcdl.github.io)\n'
  md += '* yotta name: `' + xpack.name + '`\n'
  md += '* yotta repo: ' + yotta_repo + '\n'
  md += '* ' + xpack.repository.type + ' repo: ' + xpack.repository.url
    + '\n'
  md += '* homepage: ' + xpack.homepage + '\n'
  md += '* latest archive: ' + xpack.repository.archive + '\n'
  md += '\n'

  md += '## Version\n'
  md += '\n'
  md += '* ' + xpack.version + '\n'
  md += '\n'

  md += '## Releases\n'
  var releases = xpack.releases
  if (releases && releases.length > 0) {
    md += '\n'
    for (var i = 0; i < releases.length; ++i) {
      md += '### ' + releases[i].version
      if (releases[i].date) {
        md += ' / ' + releases[i].date
      }
      md += '\n'
      md += releases[i].description + '\n'
      md += '\n'
      if (releases[i].archives && releases[i].archives.length > 0) {
        md += 'Archives: \n'
        md += '\n'
        for (var j = 0; j < releases[i].archives.length; ++j) {
          md += '* ' + releases[i].archives[j] + '\n'
        }
        md += '\n'
      }
    }
  } else {
    md += '\n'
    md += '* none\n'
  }
  md += '\n'

  md += '## Package maintainers\n'
  md += createPersonsList(xpack.maintainers)

  md += '## Content contributors\n'
  md += createPersonsList(xpack.contributors)

  md += '## Support\n'
  var support = xpack.support
  if (support && support.length > 0) {
    md += '\n'
    for (var i = 0; i < support.length; ++i) {
      md += '* [' + support[i].description + '](' + support[i].url
        + ')\n'
    }
  } else {
    md += '\n'
    md += '* none\n'
  }
  md += '\n'

  md += '## Dependencies\n'
  var dependencies = xpack.dependencies
  if (dependencies && dependencies.length > 0) {
    md += '\n'
    for (var i = 0; i < dependencies.length; ++i) {
      md += '* ' + dependencies[i].name + ' ' + dependencies[i].version
        + '\n'
    }
  } else {
    md += '\n'
    md += '* none\n'
  }
  md += '\n'

  md += '## Keywords\n'
  var keywords = xpack.keywords
  if (keywords && keywords.length > 0) {
    md += '\n'
    for (var i = 0; i < keywords.length; ++i) {
      md += '* ' + keywords[i] + '\n'
    }
  } else {
    md += '\n'
    md += '* none\n'
  }
  md += '\n'

  md += '## License\n'
  var license = xpack.license
  if (license) {
    md += '\n'
    if (license.startsWith('LicenseRef-')) {
      var file_ref = license.substr('LicenseRef-'.length)
      md += '* custom, see `' + file_ref + '` in package root\n'

      context.console.log('LicenseRef')
    } else {
      md += '* [spdx](http://spdx.org/licenses/): ' + license + '\n'
    }
  } else {
    md += '\n'
    md += '* none\n'
  }
  md += '\n'

  try {
    var notes = fs.readFileSync('NOTES.md')
    md += '--- \n'
    md += notes
    md += '\n'
  } catch (err) {
    context.console.log(err.message)
  }
  md += '--- \n'

  context.console.log(md)

  fs.writeFileSync('README.md', md, 'utf8')
  context.console.log("'README.md' written.")

  return module
}

var createPersonsList = function (persons) {
  var md = ""

  if (persons && persons.length > 0) {
    md += '\n'
    for (var i = 0; i < persons.length; ++i) {
      var url = persons[i].url
      if (url) {
        md += '* [' + persons[i].name + '](' + url + ')'
      } else {
        md += '* ' + persons[i].name
      }
      if (persons[i].email) {
        md += ' [&lt;' + persons[i].email + '&gt;](mailto:'
          + persons[i].email + ')'
      }
      md += '\n'
    }
  } else {
    md += '\n'
    md += '* none\n'
  }
  md += '\n'

  return md
}

// ----------------------------------------------------------------------------
