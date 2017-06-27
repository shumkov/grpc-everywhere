"use strict";

const fs = require('fs');

/**
 * @param {string} name
 * @param {Object} config
 * @param {Logger} logger
 * @return {FastCgiConnector}
 */
function createConnector(name, config, logger) {
    let connectorFile;
    for (let filePath of [`${__dirname}/${name}Connector`, name]) {
        if (fs.existsSync(`${filePath}.js`)) {
            connectorFile = filePath;
            break;
        }
    }

    if (connectorFile === null) {
        throw new Error(`Wrong connector: ${name}`);
    }

    const Connector = require(connectorFile);

    return new Connector(config, logger);
}

module.exports = createConnector;