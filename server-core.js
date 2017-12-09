'use strict';

const http = require('http');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');

let MESSAGES = [];

const METHODS_HANDLERS = {
    'POST': handlePost,
    'GET': handleGet
};

const server = http.createServer();

server.on('request', (req, res) => {
    const query = parseUrl(req.url);
    if (!query.pathname.startsWith('/messages')) {
        res.statusCode = 404;
        res.end();

        return;
    }

    res.setHeader('Content-Type', 'application/json');
    METHODS_HANDLERS[req.method](req, res);
});

function handlePost(req, res) {
    const { query } = parseUrl(req.url);
    const { from, to } = parseQuery(query);

    let body = [];

    req
        .on('data', (chunk) => {
            body.push(chunk);
        })
        .on('end', () => {
            body = body.toString('utf-8');
            const { text } = JSON.parse(body);

            let message = { text };
            if (from !== undefined) {
                message.from = from;
            }
            if (to !== undefined) {
                message.to = to;
            }

            MESSAGES.push(message);

            res.end(JSON.stringify(message));
        });
}

function handleGet(req, res) {
    const { query } = parseUrl(req.url);
    const { from, to } = parseQuery(query);

    let suitableMessages = MESSAGES.filter(message => {
        return (from === undefined || from === message.from) &&
            (to === undefined || to === message.to);
    });
    res.end(JSON.stringify(suitableMessages));
}

module.exports = server;
