'use strict';

const Promise = require('bluebird');
const Twilio = require('twilio').Twilio;
const UserStore = require('../stores/UserStore');

module.exports = {

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
  },

  performAction(payload) {
    if (this.client) {
      return this.userStore.get(payload.tid, payload.userId).then((toUser) => {
        return this.client.sendMessage({
          to: toUser.phonenumber,
          from: this.config.twilio.fromPhoneNumber,
          body: payload.actionParams.smsText
        });
      });
    } else {
      return Promise.reject('SMS action is not initialized.');
    }
  }

};
