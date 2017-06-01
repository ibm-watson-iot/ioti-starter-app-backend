'use strict';


const Twilio = require('twilio').Twilio;
const Promise = require('bluebird');
const UserStore = require('../stores/UserStore');

module.exports = {

  send(user, payload) {
    return this.client.sendMessage({
      to: user.phonenumber,
      from: this.config.twilio.fromPhoneNumber,
      body: payload.smsText
    });
  },

  run(payload) {
    const promise = this.userStore.get(payload.tid, payload.userId);
    return promise.then((user) => {
      return this.send(user, payload);
    });
  },

  performAction(payload) {
    if (this.client) {
      console.log(payload);
      return this.run(payload);
    } else {
      return Promise.reject('client not setup');
    }
  },

  init(config) {
    this.userStore = new UserStore(config.dbName, config.dbCredentials);
    config = config.actions;
    this.config = config;
    try {
      this.client = new Twilio(config.twilio.username, config.twilio.password);
      this.client.sendMessage = Promise.promisify(this.client.sendMessage);
    } catch (e) {
      console.warn('if you dont want to have the sms-action, remove it from the action-routes');
      console.error(e);
    }
  }
};
