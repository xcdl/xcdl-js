# xcdl-js

An experimental version of the `xcdl` command line application, implemented in JavaScript in the node.js framework.

## Install

```
npm install xcdl
```

## Run

The only command implemented is `generate-xpdsc`, to extract content from the CMSIS .pdsc files and store in JSON.

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


