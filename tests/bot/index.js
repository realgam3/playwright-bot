const bot = require("../../bot");
const config = require("./config");

(async () => {
    await bot.run({
        "timeout": 30000,
        "actions": [
            {
                "action": "page.goto",
                "args": ["https://www.google.com"]
            },
            {
                "action": "page.waitForTimeout",
                "args": [10000]
            }
        ],
    }, config);
})();
