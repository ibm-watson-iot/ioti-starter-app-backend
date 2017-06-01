'use strict';

const Twilio = require('twilio').Twilio;
const Promise = require('bluebird');
const UserStore = require('../stores/UserStore');

module.exports = {

  call(user, payload) {
    return this.client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: user.phonenumber,
      from: this.config.twilio.fromPhoneNumber
    });
  },

  run(payload) {
    return this.userStore.get(payload.tid, payload.userId)
    .then((user) => {
      return this.call(user, payload);
    });
  },

  performAction(payload) {
    if (this.client) {
      console.log(JSON.stringify(payload));
      return this.run(payload);
    } else {
      return Promise.reject('action phone call not initialized');
    }
  },

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
  }
};
