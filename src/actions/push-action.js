'use strict';

const request = require('request-promise');
const UserStore = require('../stores/UserStore');

module.exports = {

  init(config) {
    this.userStore = new UserStore(config.dbName, config.dbCredentials);
    config = config.actions;
    if (config.push.url) {
      this.pushCredentials = {
        url: config.push.url,
        appSecret: config.push.appSecret
      };
      this.initialized = true;
    }
  },

  performAction(payload) {
    const method = 'pushios.performAction';
    if (this.initialized) {
      console.info(method, 'Preparing payload for the push notification service.');
      const pushPayload = {
        deviceIds: [payload.deviceIds],
        alert: payload.payload + ' for user ' + payload.userId,
        extra: payload.extra || {}
      };
      pushPayload.extra.shieldID = payload.shieldId;

      const url = this.pushCredentials.url + '/messages';
      const appSecret = this.pushCredentials.appSecret;

      const headers = {
        appSecret: appSecret,
        'Content-Type': 'application/json'
      };
      const inputBody = {
        message: {
          alert: pushPayload.alert
        },
        target: {
          deviceIds: pushPayload.deviceIds
        },
        settings: {
          apns: {
            sound: 'default',
            payload: pushPayload.extra
          }
        }
      };

      return request.post({
        url: url,
        headers: headers,
        body: JSON.stringify(inputBody)
      })
      .then((err, response, body) => {
        console.info(method, 'Posting a message to Push Notification Service is successful.');
      })
      .catch((err) => {
        console.error(method, 'Posting a message to Push Notification Service is failed.', err);
      });
    } else {
      return Promise.reject('Trying to fire not initialized pushios action!');
    }
  }
};
