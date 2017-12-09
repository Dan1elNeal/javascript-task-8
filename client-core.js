'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const parseArgs = require('minimist');
const request = require('request');
const chalk = require('chalk');

let isDetailed = true;
const serverUrl = 'http://localhost:8080/messages';

function execute() {
    let argv = parseArgs(process.argv.slice(2));
    let command = argv._[0];
    isDetailed = argv.v;

    if (command === 'list') {
        return getMessages(argv.from, argv.to);
    }
    if (command === 'send') {
        return postMessage(argv.from, argv.to, argv.text);
    }
    if (command === 'delete') {
        return deleteMessage(argv.id);
    }
    if (command === 'edit') {
        return editMessage(argv.id, argv.text);
    }

    return Promise.reject('unknown command');
}

function getMessages(from, to) {
    const options = {
        url: serverUrl,
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
        url: serverUrl,
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

function deleteMessage(id) {
    const options = {
        url: `${serverUrl}/${id}`,
        method: 'DELETE',
        json: true
    };

    return new Promise((resolve, reject) => {
        request(options, (error) => {
            if (error) {
                reject(error);
            }
            resolve('DELETED');
        });
    });
}

function editMessage(id, text) {
    const options = {
        url: `${serverUrl}/${id}`,
        method: 'PATCH',
        json: true,
        body: { text }
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
