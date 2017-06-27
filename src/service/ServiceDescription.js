"use strict";

require('object.values').shim();

class ServiceDescription {
    constructor(serviceName, proto) {
        this.proto = proto;
        this.serviceName = serviceName;
        this.service = null;
        this.packageName = ServiceDescription.getPackageNameOfService(serviceName);
    }

    getService() {
        if (this.service !== null) {
            return this.service;
        }

        let client = ServiceDescription.getClient(this.proto, this.serviceName);

        this.service = client.service;

        return this.service;
    }

    static getClient(proto, serviceName) {
        let node = proto;
        let chunks = serviceName.split('.');

        for (let chunk of chunks) {
            if (node.hasOwnProperty(chunk)) {
                node = node[chunk];
            } else {
                throw new Error('Invalid service name');
            }
        }

        if (node.name !== 'Client') {
            throw new Error('Service "' + serviceName + '" are not a service');
        }

        return node;
    }

    getMethodsDescriptions() {
        let service = this.getService();

        let baseDescription = {
            packageName: this.packageName,
            serviceName: service.name,
        };

        let methods = [];

        for (let methodName of Object.keys(service)) {
            if (service.hasOwnProperty(methodName)) {
                let method = service[methodName];
                let methodDescription = Object.assign({
                    methodName: method.originalName,
                    requestMessageName: method.requestType.name,
                    responseMessageName: method.responseType.name,
                    isRequestStream: method.requestStream,
                    isResponseStream: method.responseStream
                }, baseDescription);

                methods.push(methodDescription);
            }
        }

        return methods;
    }

    static getPackageNameOfService(serviceName) {
        let serviceChunks = serviceName.split('.');
        serviceChunks.pop();

        return serviceChunks.join('.');
    }
}

module.exports = ServiceDescription;