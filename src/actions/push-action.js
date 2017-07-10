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
      return this.userStore.get(payload.tid, payload.userId).then((toUser) => {
        console.info(method, 'Preparing payload for the push notification service.');
        const url = this.pushCredentials.url + '/messages';
        const appSecret = this.pushCredentials.appSecret;
        const headers = {
          appSecret: appSecret,
          'Content-Type': 'application/json'
        };
        const inputBody = {
          message: {
            alert: payload.actionParams.hazardTitle + ' for user ' + toUser.name,
          },
          target: {
            deviceIds: payload.actionParams.deviceIds,
          },
          settings: {
            apns: {
              sound: 'default',
              payload: (payload.actionParams || {})
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
      });
    } else {
      return Promise.reject('Trying to fire not initialized pushios action!');
    }
  }
};
