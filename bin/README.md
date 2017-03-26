
## `xcdl-cli.js`

This executable script starts node via `#!/usr/bin/env node` and passes the name of the string and all the args strings from the command line.

Inside the script arrive:

```
argv[0] = '/usr/local/bin/node'
argv[1] = '/.../xcdl-js.git/bin/xcdl-cli.js' 
argv[2] = 'command'
argv[3] = '--option'
argv[4] = '...'
```

The `bin` map contains mappings from command lines to this script. (default map is from the package name to this script).

```
"xcdl": "./bin/xcdl-cli.js"
```

## `xcdl`, `xcdl-js`

Both are identical; contain a Bash script, expected to run on POSIX platforms, like GNU/Linux, macOS, but also minGW, minMW-w64, CYGWIN, possibly Windows Ubuntu Shell.

Basically it calls node with the `xcdl-cli.js` script and the rest of the args.

Currently not used.

## `xcdl.cmd`

Is a Windows command line script.

Basically it calls node.exe with the `xcdl-cli.js` script and the rest of the args

Currently not used.

