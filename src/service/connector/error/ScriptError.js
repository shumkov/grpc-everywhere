"use strict";

const ExtendableError = require('es6-error');

class ScriptError extends ExtendableError {
    constructor(message) {
        super(message);
    }
}

module.exports = ScriptError;