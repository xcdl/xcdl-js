# xcdl-js

An experimental version of the `xcdl` command line application, implemented in JavaScript in the node.js framework. The project is publicly available from [GitHub](https://github.com/xcdl). 

## Install

The binary module is available in the NPM repository as [xcdl](https://www.npmjs.com/package/xcdl) and can be installed with:

```
npm install xcdl
```

## Run

### generate-xpdsc

The only command implemented is `generate-xpdsc`, to extract content from a CMSIS .PDSC file and store it in JSON, to be included in XCDL packages.

```
xcdl-js generate-xpdsc -i pdsc -o json
```

## Publish

To publish the module, update the version field in `package.json` and run:

```
cd xcdl-js.git
npm publish
```

## Notes

As an experiment, this code was intentionally kept simple; asynchronous calls were avoided (actually were not needed at all).

Error processing is minimalistic; same for command line processing.


