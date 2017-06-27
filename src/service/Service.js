"use strict";

const fs = require('fs');
const grpc = require('grpc');
const HandlersProvider = require('./HandlersProvider');
const ServiceDescription = require('./ServiceDescription');
const createConnector = require('./connector/createConnector');
const createLogger = require('./createLogger');

class Service {
    /**
     *
     * @param {string} name
     * @param {Object} config
     */
    constructor(name, config) {
        this.name = name;

        if (!fs.existsSync(config.protoFile)) {
            throw new Error(`${config.protoFile} proto file doesn't exists`);
        }

        let proto = grpc.load(config.protoFile);

        this.description = new ServiceDescription(config.service, proto);

        this.logger = createLogger(this.name, config.logs);

        this.connector = createConnector(config.connector.name, config.connector.options, this.logger);

        this.handlersProvider = new HandlersProvider(this.description, this.connector, this.logger);
    }
}

module.exports = Service;