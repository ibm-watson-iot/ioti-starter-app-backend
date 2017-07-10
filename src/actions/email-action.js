'use strict';

const Promise = require('bluebird');
const nodemailer = require('nodemailer');
const UserStore = require('../stores/UserStore');

module.exports = {

  init(config) {
    this.userStore = new UserStore(config.dbName, config.dbCredentials);
    config = config.actions;
    this.config = config;
    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      host: config.email.url,
      port: config.email.port * 1,
      auth: {
        user: config.email.username,
        pass: config.email.password
      }
    });
    this.transporter.sendMail = Promise.promisify(this.transporter.sendMail);
  },

  performAction(payload) {
    return this.userStore.get(payload.tid, payload.userId).then((toUser) => {
      // setup email data with unicode symbols
      const mailOptions = {
        from: `${this.config.email.fromName} <${this.config.email.from}>`,
        to: toUser.email,
        subject: payload.actionParams.emailSubject,
        text: payload.actionParams.emailText,
        html: payload.actionParams.emailHtml
      };
      // send mail with defined transport object
      return this.transporter.sendMail(mailOptions).then((info) => {
        console.log('Message %s sent: %s', info.messageId, info.response);
      });
    });
  }
};
