"use strict";

const ExtendableError = require('es6-error');

class ConnectorError extends ExtendableError {
    constructor(message) {
        super(message);
    }
}

module.exports = ConnectorError;