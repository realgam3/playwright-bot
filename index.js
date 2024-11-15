const rpcBot = require("@rpc-bot/bot");
const {log} = require("@rpc-bot/bot/logs");

const {getKey} = require("./utils");
const defaultConfig = require("./config");

async function main(options = {}) {
    rpcBot.main({
        config: getKey(options, "config", defaultConfig),
        ...options,
    }).catch(async (error) => {
        log.error(`Failed to run bot (${error.name}: ${error.message})`);
        process.exit(1);
    });
}

module.exports = {
    main,
}