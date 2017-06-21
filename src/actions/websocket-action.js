'use strict';

const WebSocket = require('ws');
const express = require('express');
const Promise = require('bluebird');

module.exports = {

  init: function(config) {

    setTimeout(() => {
      if (!express.app.server) {
        this.init(config);
        return;
      }
      const app = express.app;
      const wss = new WebSocket.Server({
        server: app.server,
        path: '/notifications'
      });

      this.clientConnection = {};

      wss.on('connection', (ws) => {
        ws.on('message', (message) => {
          message = JSON.parse(message);
          if (!this.clientConnection[message.userId]) {
            // TODO: check message.userId, message.userKey/password
            this.clientConnection[message.userId] = ws;
          }
        });

        ws.on('close', () => {
          const key = Object.keys(this.clientConnection).find((k) => {
            return this.clientConnection[k] === ws;
          });
          if (key) {
            delete this.clientConnection[key];
          }
        });
      });

      function heartbeat() {
        this.isAlive = true;
      }

      wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', heartbeat);
      });

      const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
          if (ws.isAlive === false) {
            const key = Object.keys(this.clientConnection).find((k) => {
              return this.clientConnection[k] === ws;
            });
            if (key) {
              delete this.clientConnection[key];
            }
            return ws.terminate();
          }

          ws.isAlive = false;
          ws.ping('', false, true);
        });
      }, 30000);

      this.wss = wss;
    }, 1000);

  },

  performAction(data) {
    return Promise.try(() => {
      if (data.userId && this.clientConnection[data.userId]) {
        this.clientConnection[data.userId].send(JSON.stringify({
          event: 'new-hazard',
          data: data,
        }));
      }
    });
  }
};
