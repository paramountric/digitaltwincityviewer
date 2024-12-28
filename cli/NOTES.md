# UPDATE CLI

- Changed package.json
- Changed the init.go, bootstrap.go, to use the template from apps directory
- Update the root command in cmd/root.go to `dtcv`
- Change root.go suggestUpgrade output
- Update scripts/postinstall.js to use the correct package name in output
- Modify code
- Run yarn build:cli
- Publish bin to package registry for user to use npx "package name" init or npx install -g "package name", "dtcv init"
