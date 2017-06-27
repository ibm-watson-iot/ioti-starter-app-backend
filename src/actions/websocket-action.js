'use strict';

const WebSocket = require('ws');
const express = require('express');
const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('../utils/logger');

module.exports = {

  removeClient(ws) {
    let key = Object.keys(this.clientConnection).find((k) => {
      return this.clientConnection[k] === ws;
    });
    if (key) {
      delete this.clientConnection[key];
    }

    key = Object.keys(this.insuranceConnections).find((k) => {
      return this.insuranceConnections[k] === ws;
    });
    if (key) {
      delete this.insuranceConnections[key];
    }
  },

  init: function(config) {

    this.sendToInsurer = _.throttle(this.sendToInsurer, 1000);

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
      this.insuranceConnections = {};

      wss.on('connection', (ws) => {
        ws.on('message', (message) => {
          message = JSON.parse(message);
          logger.info('no-tid', 'websocket.message', message);
          if (!this.clientConnection[message.userId] && !message.isInsurer) {
            // TODO: check message.userId, message.userKey/password
            this.clientConnection[message.userId] = ws;
            logger.info('no-tid', 'websocket.message', 'set as client connection');
          }

          if (!this.insuranceConnections[message.userId] && message.isInsurer) {
            // TODO: check message.userId, message.userKey/password
            this.insuranceConnections[message.userId] = ws;
            logger.info('no-tid', 'websocket.message', 'set as insurer connection');
          }
        });

        ws.on('close', () => {
          this.removeClient(ws);
          logger.info('no-tid', 'websocket.close', 'removed connection');
        });
      });

      function heartbeat() {
        this.isAlive = true;
      }

      wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', heartbeat);
      });

      setInterval(() => {
        wss.clients.forEach((ws) => {
          if (ws.isAlive === false) {
            this.removeClient(ws);
            return ws.terminate();
          }

          ws.isAlive = false;
          return ws.ping('', false, true);
        });
      }, 30000);

      this.wss = wss;
    }, 1000);
  },

  sendToInsurer: function(data) {
    logger.info('no-tid', 'websocket.sendToInsurer', 'send to all insurers');
    Object.keys(this.insuranceConnections).forEach((key) => {
      const conn = this.insuranceConnections[key];
      try {
        conn.send(JSON.stringify({
          event: 'new-hazard',
          data: data,
        }));
      } catch (e) {}
    });
  },

  performAction(data) {
    logger.info('no-tid', 'websocket.performAction', data);
    try {
      if (data.userId && this.clientConnection[data.userId]) {
        this.clientConnection[data.userId].send(JSON.stringify({
          event: 'new-hazard',
          data: data,
        }));
      }
    } catch (e) {}

    this.sendToInsurer(data);
    return Promise.resolve();
  }
};
