const {chromium, firefox, webkit} = require("playwright");

function sleep(ms = 1000) {
    return new Promise(r => setTimeout(r, ms));
}

async function getBrowser(browserConfig) {
    let browser = null;
    const browserOptions = browserConfig.options;
    switch (browserConfig.product) {
        case "firefox": {
            browser = await firefox.launch(browserOptions);
            break;
        }
        case "chrome": {
            browser = await chromium.launch(browserOptions);
            break;
        }
        case "webkit": {
            browser = await webkit.launch(browserOptions);
            break;
        }
        default: {
            throw new Error(`Invalid browser product: ${browserConfig.product}`);
        }
    }
    return browser;
}

module.exports = {
    sleep,
    getBrowser,
}