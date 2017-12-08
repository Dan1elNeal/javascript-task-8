'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const parseArgs = require('minimist');
const request = require('request');
const chalk = require('chalk');

function execute() {
    let argv = parseArgs(process.argv.slice(2));
    let command = argv._[0];

    if (command === 'list') {
        return getMessages(argv.from, argv.to);
    }
    if (command === 'send') {
        return postMessage(argv.from, argv.to, argv.text);
    }

    return Promise.reject('unknown command');
}

function getMessages(from, to) {
    const options = {
        url: 'http://localhost:8080/messages',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        qs: { from, to }
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(getBeautifulMessages(JSON.parse(body)));
        });
    });
}

function postMessage(from, to, text) {
    const options = {
        url: 'http://localhost:8080/messages',
        method: 'POST',
        json: true,
        body: { text },
        qs: { from, to }
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(getBeautifulMessage(body));
        });
    });
}

function getBeautifulMessages(messages) {
    let beautifulMessages = [];
    messages.forEach(message => {
        let beautifulMessage = getBeautifulMessage(message);
        beautifulMessages.push(beautifulMessage);
    });

    return beautifulMessages.join('\n\n');
}

function getBeautifulMessage(message) {
    let beautifulMessage = '';

    if (message.from !== undefined) {
        beautifulMessage += `${chalk.hex('#f00')('FROM')}: ${message.from}\n`;
    }
    if (message.to !== undefined) {
        beautifulMessage += `${chalk.hex('#f00')('TO')}: ${message.to}\n`;
    }
    beautifulMessage += `${chalk.hex('#0f0')('TEXT')}: ${message.text}`;

    return beautifulMessage;
}
