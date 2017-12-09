'use strict';

module.exports.execute = execute;
module.exports.isStar = true;

const parseArgs = require('minimist');
const request = require('request');
const chalk = require('chalk');

const COMMANDS = {
    'list': getMessages,
    'send': postMessage
};

const serverUrl = 'http://localhost:8080/messages';

function execute() {
    let args = parseArgs(process.argv.slice(2));
    let command = args._[0];

    if (COMMANDS[command] === undefined) {
        return Promise.reject('unknown command');
    }

    return COMMANDS[command](args);
}

function getMessages(args) {
    const options = {
        url: serverUrl,
        method: 'GET',
        json: true,
        qs: { from: args.from, to: args.to }
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(getBeautifulMessages(body));
        });
    });
}

function postMessage(args) {
    const options = {
        url: serverUrl,
        method: 'POST',
        json: true,
        body: { text: args.text },
        qs: { from: args.from, to: args.to }
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
    return messages.map(message => getBeautifulMessage(message)).join('\n\n');
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
