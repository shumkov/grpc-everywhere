"use strict";

const winston = require('winston');

function createLogger(serviceName, config) {
    let transports = config.map((logConfig) => {
        return new (winston.transports[logConfig.type])(logConfig);
    });

    transports.push(new (winston.transports.Console)({
        label: serviceName,
        timestamp: true
    }));

    return new winston.Logger({
        transports: transports
    });
}

module.exports = createLogger;