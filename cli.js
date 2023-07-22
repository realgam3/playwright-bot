#!/usr/bin/env node

const {log} = require("rpc-bot/logs");
const {parseArgs} = require("rpc-bot/parsers");

const version = "0.1.0";

require(".")
    .main({
        args: parseArgs((program) => {
            program
                .name("playwright-bot")
                .description(
                    "Playwright Bot - A sophisticated queue-driven bot " +
                    "designed to manage and execute browser automation across multiple remote machines."
                )
                .version(version)
        }),
    })
    .catch((error) => {
        log.error(`Failed to run bot (${error.name}: ${error.message})`);
        process.exit(1);
    });
