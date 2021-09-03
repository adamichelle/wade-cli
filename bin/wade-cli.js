#!/usr/bin/env node

const cli = require("../lib/cli");
(async function() {
    await cli.cli(process.argv);
})();