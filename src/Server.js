"use strict";

const grpc = require('grpc');
const winston = require('winston');
const asciify = require('asciify');

const Service = require('./service/Service');

class Server {
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.config = config;

        this.logger = Server.createLogger();

        grpc.setLogger(this.logger);
        // grpc.setLogVerbosity(grpc.logVerbosity.INFO);

        this.grpcServer = new grpc.Server();

        this.services = [];

        for (let serviceConfig of this.config.services) {
            this.addService(new Service(serviceConfig.name, serviceConfig));
        }
    }

    /**
     * Start server
     *
     * @returns {Promise}
     */
    start() {
        let connectionString = `${this.config.host}:${this.config.port}`;

        this.grpcServer.bind(
            connectionString,
            grpc.ServerCredentials.createInsecure()
        );

        let connectorsReadyPromises = this.services.map((service) => {
            return service.connector.ready;
        });

        return Promise.all(connectorsReadyPromises).then(() => {
            this.grpcServer.start();

            asciify(' GRPC', {font: 'larry3d'}, (error, text) => {
                console.log("\n\n" + text);

                asciify(' everywhere', {font: 'small'}, (error, text) => {
                    console.log(text);

                    let servicesString = this.services.map((service) => {
                        return ' - ' + service.name;
                    }).join("\n");

                    console.log(`Loaded services:\n${servicesString}\n`);

                    this.logger.info(`Listen ${connectionString}`);
                });
            });
        }).catch((error) => {
            this.logger.error(error);
        });
    }

    /**
     * Stop the server
     *
     * @returns {Promise}
     */
    stop() {
        return new Promise((resolve) => {
            this.grpcServer.tryShutdown(() => {
                let lastsRequestsPromise = this.services.map((service) => {
                    return service.connector.lastRequestPromise;
                }).filter((promise) => {
                    return promise !== null;
                });

                Promise.all(lastsRequestsPromise).then(resolve, resolve);
            });
        }).catch((error) => {
            this.logger.error(error);

            throw error;
        });
    }

    /**
     * @param {Service} service
     * @returns {FastCgiConnector}
     */
    addService(service) {
        this.grpcServer.addService(
            service.description.getService(),
            service.handlersProvider.getHandlers()
        );

        this.services.push(service);
    }

    /**
     * @private
     * @returns {winston.Logger}
     */
    static createLogger() {
        return new winston.Logger({
            transports: [
                new winston.transports.Console({
                    handleExceptions: true,
                    timestamp: true
                })
            ]
        });
    }
}

module.exports = Server;