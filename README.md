# xcdl-js

An experimental version of the `xcdl` command line application, implemented in JavaScript in the node.js framework. The project is publicly available from [GitHub](https://github.com/xcdl/xcdl-js).

## Prerequisites

### node.js

[node.js](https://nodejs.org/en/) is a JavaScript runtime. Download the latest installer package from [Current](https://nodejs.org/en/download/current/) and install it. The default install location is somewhere in the system folders (like `/usr/local/bin/node` and `/usr/local/lib/node_modules`). If you prefer a sandboxed setup, download the binary archive (see the _All download options_ link down the page) and unpack it in a folder of your choice.


### npm

[npm](https://www.npmjs.com) is the package manager for JavaScript. Normally it comes bundled with node.js, so no need to install it separately.
 
However it is recommended from time to time to update `npm` to the latest version:

```
sudo npm install npm -g
```

(the `-g` is required to update the global version; without this option it will install a local version in the user home folder).


## Install **xcdl**

The **xcdl** binary module is available from the npm repository as [xcdl](https://www.npmjs.com/package/xcdl) and can be installed with:

```
sudo npm install xcdl -g
```

The utility is installed somewhere in the system folders (like `/usr/local/bin/xcdl and `/usr/local/lib/node_modules`), and can be executed directly with the `xcdl` command.

It is also possible to install the `xcdl` utility locally, in the user home folder:

```
npm install xcdl
```

In this case the default install location is in `$HOME/node-modules`, and can be executed with the `~/node_modules/xcdl/bin/xcdl` command.

## Run

### generate-xpdsc

The only command implemented is `generate-xpdsc`, to extract content from a CMSIS .PDSC file and store it in JSON, to be included in xPacks (XCDL packages).

```
xcdl generate-xpdsc -i pdsc -o json
```

## Development

The current development environment is based on [Visual Studio Code](https://code.visualstudio.com). The initial development environment was Eclipse with the `nodeclipse` plug-ins, but results were disappointing.

## Publish

To publish the module, update the version field in `package.json` and run:

```
cd xcdl-js.git
npm publish
```

## Notes

As an experiment, this code was intentionally kept simple; asynchronous calls were avoided (actually were not needed at all).

Error processing is minimalistic; same for command line processing.
