// Setup pino
const pino = require('pino');

var fs = require('fs');
var dir = './logs';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Use pino-pretty when logging to the console
const transport = pino.transport({
    targets: [
        {
            level: "trace",
            target: "pino/file",
            options: { destination: "logs/server-log" },
        },
        {
            level: "trace",
            target: "pino-pretty",
            options: {
                colorize: true
            }
        },
    ],
});

const minimum_log_level = "debug";

const logger = 
    process.env.CONSOLE_ONLY == "true" ?
    pino({
        level: process.env.PINO_LOG_LEVEL || minimum_log_level, 
    })
    :
    pino({
        level: process.env.PINO_LOG_LEVEL || minimum_log_level, 
    }, transport);

module.exports = logger;