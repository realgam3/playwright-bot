const Xvfb = require("xvfb");
const axios = require("axios");
const stringify = require("json-stringify-safe");

const utils = require("./utils");
const config = require("./config");

async function run(data, configuration = config, browser = null) {
    // Bot Context
    const config = configuration;

    const xvfb = new Xvfb({
        silent: true,
        xvfb_args: config.xvfb.args,
    });
    xvfb.start();

    browser = browser || await utils.getBrowser(config.browser);
    const browserContext = await browser.newContext(config.context.options);
    const context = {
        browser: browser,
        browserContext: browserContext,
        page: await browserContext.newPage(),
        // save the result for the next function (if needed)
        result: null,
        results: [],
        // Add custom functions (like getFlag)
        extend: config.extend,
    };
    global.context = context;

    // Kill Browser Function
    const killBrowser = async function () {
        try {
            await context.browserContext.close();
            if (!browser) {
                await context.browser.close();
            }
        } catch (error) {
            console.error(`Error closing browser after timeout: ${error}`);
        }
    }

    // Hard Timeout - To Protect The Bot
    let timedOut = false;
    const timeout = setTimeout(async function () {
        await killBrowser();
        timedOut = true;
        console.error(`the data ${JSON.stringify(data)} timed out`);
    }, data.timeout || config.timeout);

    // Setup Events
    for (let [eventName, event] of Object.entries(config.page.events)) {
        context.page.on(eventName, event);
    }

    // Hook JavaScript Functions
    await context.page.addInitScript(`(${config.page.evaluate.document_start.toString()})();`);

    // Run Action Batch
    let i = 0;
    for (let {action, args = []} of data.actions || []) {
        try {
            if (timedOut) {
                return;
            }
            if (config.allowed_actions && !config.allowed_actions.includes(action)) {
                console.warn(`the action ${action} was not allowed`);
                continue;
            }
            console.log(`${action}(${JSON.stringify(args).replace(/(^\[|]$)/g, '')})`);
            const [objectName, funcName] = action.split('.');
            const object = context[objectName];
            const func = object[funcName];
            context.result = await func.apply(object, args);
            context.results.push({
                "action": action,
                "result": context.result,
            });
        } catch (error) {
            console.error(`Error running action ${action}: ${error}`);
            context.error = error;
            context.results.push({
                "action": action,
                "error": {
                    "name": error.name,
                    "message": error.message,
                    "timedOut": timedOut,
                }
            });
            break;
        }
        i++;
    }

    clearTimeout(timeout);
    await killBrowser();
    xvfb.stop();

    if (data.webhook) {
        axios.post(data.webhook, stringify({
            "status": context.error ? "fail" : "ok",
            "result": context.results.pop(),
            "error": context.error?.name,
        }), {
            headers: {
                "Content-Type": "application/json",
            }
        }).catch((e) => {
            console.error(`[ERROR] failed to send webhook: ${e.name}`);
        });
    }
}

module.exports = {
    run
}
