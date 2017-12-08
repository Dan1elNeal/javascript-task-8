'use strict';

module.exports.execute = execute;
module.exports.isStar = true;

const parseArgs = require('minimist');
const request = require('request');
const chalk = require('chalk');

const COMMANDS = {
    'list': getMessages,
    'send': postMessage,
    'delete': deleteMessage,
    'edit': editMessage
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
            resolve(getBeautifulMessages(body, args.v));
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
            resolve(getBeautifulMessage(body, args.v));
        });
    });
}

function deleteMessage(args) {
    const options = {
        url: `${serverUrl}/${args.id}`,
        method: 'DELETE',
        json: true
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            if (body.status === 'ok') {
                resolve('DELETED');
            }
            reject('Not deleted');
        });
    });
}

function editMessage(args) {
    const options = {
        url: `${serverUrl}/${args.id}`,
        method: 'PATCH',
        json: true,
        body: { text: args.text }
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            if (body !== undefined) {
                resolve(getBeautifulMessage(body, args.v));
            }
            reject('Not edited');
        });
    });
}

function getBeautifulMessages(messages, isDetailed) {
    return messages.map(message => getBeautifulMessage(message, isDetailed)).join('\n\n');
}

function getBeautifulMessage(message, isDetailed) {
    let beautifulMessage = '';

    if (isDetailed) {
        beautifulMessage += `${chalk.hex('#ff0')('ID')}: ${message.id}\n`;
    }
    if (message.from !== undefined) {
        beautifulMessage += `${chalk.hex('#f00')('FROM')}: ${message.from}\n`;
    }
    if (message.to !== undefined) {
        beautifulMessage += `${chalk.hex('#f00')('TO')}: ${message.to}\n`;
    }
    if (message.edited) {
        beautifulMessage +=
            `${chalk.hex('#0f0')('TEXT')}: ${message.text}${chalk.hex('#777')('(edited)')}`;
    } else {
        beautifulMessage += `${chalk.hex('#0f0')('TEXT')}: ${message.text}`;
    }

    return beautifulMessage;
}
