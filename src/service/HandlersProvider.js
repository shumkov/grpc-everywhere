"use strict";

const grpc = require('grpc');

class HandlersProvider {
    constructor(serviceDescription, connector, logger) {
        this.serviceDescription = serviceDescription;
        this.connector = connector;
        this.logger = logger;
    }

    getHandlers() {
        let handlers = {};

        for (let methodDescription of this.serviceDescription.getMethodsDescriptions()) {
            if (methodDescription.isRequestStream || methodDescription.isResponseStream) {
                throw new Error('Streaming not implemented');
            }

            let handlerName = HandlersProvider.methodNameToHandlerName(methodDescription.methodName);

            handlers[handlerName] = this.createUnaryHandler(methodDescription);
        }

        return handlers;
    }

    createUnaryHandler(methodDescription) {
        return (call, callback) => {
            let startTime = process.hrtime();

            let promise = this.connector.send(
                methodDescription,
                JSON.stringify(call.request)
            );

            promise.then((output) => {
                let error = null;
                let value = null;
                let metadata = null;
                let response;

                try {
                    response = JSON.parse(output);
                } catch (e) {
                    throw new Error('Invalid response: ' + output);
                }

                if (response.isSuccess === false) {
                    metadata = new grpc.Metadata();
                    metadata.set('error', response.error.message);
                    metadata.set('code', response.error.code.toString());

                    error = new Error(response.error.message);
                } else {
                    value = response.message
                }

                callback(error, value, metadata);

                let requestDescriptor = [
                    methodDescription.packageName,
                    methodDescription.serviceName,
                    methodDescription.methodName
                ].join('.');

                this.logger.info(`Serve ${requestDescriptor}`, {
                    elapsedTime: HandlersProvider.getElapsedTimeInMs(startTime),
                    packageName: methodDescription.packageName,
                    serviceName: methodDescription.serviceName,
                    methodName: methodDescription.methodName
                });
            }).catch((error) => {
                this.logger.error(error, {
                    packageName: methodDescription.packageName,
                    serviceName: methodDescription.serviceName,
                    methodName: methodDescription.methodName
                });

                callback(error);
            });
        }
    }

    /**
     *
     * @param {Array} timeStart result of hrtime
     * @param precision
     * @returns {string}
     */
    static getElapsedTimeInMs(timeStart, precision) {
        precision = precision || 3;

        let elapsedTime = process.hrtime(timeStart);

        return ((elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6).toFixed(precision);
    }

    static methodNameToHandlerName(name) {
        return name.charAt(0).toLocaleLowerCase() + name.slice(1)
    }
}

module.exports = HandlersProvider;