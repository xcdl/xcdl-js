:: Created by npm, please don't edit manually.
@ECHO OFF

SETLOCAL

SET "NODE_EXE=%~dp0\node.exe"
IF NOT EXIST "%NODE_EXE%" (
  SET "NODE_EXE=node"
)

SET "APP_CLI_JS=%~dp0\node_modules\xcdl\bin\xcdl-js-cli.js"
FOR /F "delims=" %%F IN ('CALL "%NODE_EXE%" "%APP_CLI_JS%" prefix -g') DO (
  SET "APP_PREFIX_APP_CLI_JS=%%F\node_modules\xcdl\bin\xcdl-js-cli.js"
)
IF EXIST "%APP_PREFIX_APP_CLI_JS%" (
  SET "APP_CLI_JS=%APP_PREFIX_APP_CLI_JS%"
)

"%NODE_EXE%" "%APP_CLI_JS%" %*
