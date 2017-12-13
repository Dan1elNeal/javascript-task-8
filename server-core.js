'use strict';

const http = require('http');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');
const shortid = require('shortid');
const router = require('router');
var finalhandler = require('finalhandler');

let MESSAGES = [];

let messagesRouter = router();

const server = http.createServer(function (req, res) {
    messagesRouter(req, res, finalhandler(req, res));
});

messagesRouter.get('/messages', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const { query } = parseUrl(req.url);
    const { from, to } = parseQuery(query);

    let suitableMessages = MESSAGES.filter(message => {
        return (!from || from === message.from) &&
            (!to || to === message.to);
    });
    res.end(JSON.stringify(suitableMessages));
});

messagesRouter.post('/messages', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
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

            let message = {
                text,
                id: shortid.generate()
            };
            if (from) {
                message.from = from;
            }
            if (to) {
                message.to = to;
            }

            MESSAGES.push(message);

            res.end(JSON.stringify(message));
        });
});

messagesRouter.delete('/messages/:id', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    MESSAGES = MESSAGES.filter(message => message.id !== req.params.id);

    let okay = { status: 'ok' };
    res.end(JSON.stringify(okay));
});

messagesRouter.patch('/messages/:id', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    let body = [];

    req
        .on('data', (chunk) => {
            body.push(chunk);
        })
        .on('end', () => {
            body = body.toString('utf-8');
            const { text } = JSON.parse(body);

            for (let message of MESSAGES) {
                if (message.id === req.params.id) {
                    message.text = text;
                    message.edited = true;
                    res.end(JSON.stringify(message));
                    break;
                }
            }
        });
});

module.exports = server;
