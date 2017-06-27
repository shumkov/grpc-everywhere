"use strict";

const yaml = require('js-yaml');
const fs = require('fs');
const glob = require('glob');

/**
 * @param {string} file
 * @returns {Object}
 */
function loadConfig(file) {
    let config = fs.readFileSync(file, 'utf8');
    let parsedConfig = yaml.safeLoad(config);

    // Load services by glob if string is passed
    if (typeof parsedConfig.services === 'string') {
        let includedConfigs = glob.sync(parsedConfig.services, { nodir : true });

        parsedConfig.services = [];
        for (let includedConfigFile of includedConfigs) {
            let includedConfig = fs.readFileSync(includedConfigFile, 'utf8');
            let parsedIncludedConfig = yaml.safeLoad(includedConfig);
            parsedConfig.services.push(parsedIncludedConfig);
        }
    }

    return parsedConfig;
}

module.exports = loadConfig;