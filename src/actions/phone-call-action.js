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
      this.client.calls.create = Promise.promisify(this.client.calls.create);
    } catch (e) {
      console.error(e.message);
    }
  },

  performAction(payload) {
    if (this.client) {
      return this.userStore.get(payload.tid, payload.userId).then((toUser) => {
        return this.client.calls.create({
          url: 'http://demo.twilio.com/docs/voice.xml',
          to: toUser.phonenumber,
          from: this.config.twilio.fromPhoneNumber
        });
      });
    } else {
      return Promise.reject('Phone-Call action is not initialized.');
    }
  }

};
