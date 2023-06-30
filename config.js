const config = {
    "queue": {
        "port": parseInt(process.env.RABBITMQ_PORT || 5672),
        "host": process.env.RABBITMQ_HOST || "queue",
        "name": process.env.QUEUE_NAME || "queue",
        "username": process.env.RABBITMQ_USERNAME || "guest",
        "password": process.env.RABBITMQ_PASSWORD || "guest",
    },
    "timeout": 240000,
    "extend": {
        // Add close pages function
        closePages: async function () {
            for (let page of await context.browserContext.pages()) {
                await page.close();
            }

            context.page = await context.browserContext.newPage();
            for (let [eventName, event] of Object.entries(config.page.events)) {
                context.page.on(eventName, event);
            }
            await context.page.addInitScript(`(${config.page.evaluate.document_start.toString()})();`);
        },
        slowType: async function (selector, text, delay = 500) {
            for (let chr of text) {
                await context.page.type(selector, chr);
                await context.page.waitForTimeout(delay);
            }
        },
        setCookies: async function (cookies) {
            await context.page.addCookies(cookies);
        },
    },
    "allowed_actions": [
        "page.type",
        "page.goto",
        "page.click",
        "page.addCookies",
        "extend.slowType",
        "extend.setCookies",
        "extend.closePages",
        "page.waitForTimeout",
        "page.waitForSelector",
    ],
    "xvfb": {
        "args": [
            "-screen", "0", '1280x720x24', "-ac"
        ]
    },
    "browser": {
        "product": "chrome",
        "options": {
            "headless": true,
            "args": [
                "--no-sandbox",
                "--disable-gpu",
                "--ignore-certificate-errors",
                "--disable-dev-shm-usage",
            ]
        }
    },
    "context": {
        "options": {
            "ignoreHTTPSErrors": true,
        }
    },
    "page": {
        "events": {
            // "console": message => console.debug(`[${message.type().toUpperCase()}] ${message.text()}`),
            "error": message => console.error(message),
            "pageerror": message => console.error(message),
        },
        "evaluate": {
            "document_start": function () {
                window.open = () => {
                    console.warn('window.open');
                };
                window.prompt = () => {
                    console.warn('window.prompt');
                };
                window.confirm = () => {
                    console.warn('window.confirm');
                };
                window.alert = () => {
                    console.warn('window.alert');
                };
            }
        }
    }
}

module.exports = config;
