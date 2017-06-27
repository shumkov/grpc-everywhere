#!/usr/bin/env node

"use strict";

const yargs = require('yargs');
const Server = require('../src/Server');

let argv = yargs.usage('Usage: $0 -c [configPath]')
    .option('c', {
        alias: 'config',
        type: 'string',
        default: 'config.yml',
        describe: "Path to YAML config file"
    })
    .help('h')
    .alias('h', 'help').argv;

const loadConfig = require('../src/loadConfig');

let config = loadConfig(argv.config);

let server = new Server(config);
server.start();

process.on('SIGINT', function() {
    server.stop().then(() => {
        process.exit();
    }).catch(() => {
        process.exit(1);
    });
});