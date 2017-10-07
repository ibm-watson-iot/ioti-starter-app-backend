'use strict';

const Promise = require('bluebird');
const nodemailer = require('nodemailer');
const UserStore = require('../stores/UserStore');
const pug = require('pug');
const path = require('path');

const compileEmailTemplate = pug.compileFile(path.join(__dirname, 'email.pug'), {
  cache: true
});

function prepareEmailHtml(user, hazard) {
  return compileEmailTemplate({
    userName: `${(user) ? user.name : ''}`,
    hazardTitle: `${(hazard.actionParams) ? hazard.actionParams.hazardTitle : ''}`,
    hazardTime: `${(hazard.rawEvents && hazard.rawEvents.length !== 0) ?
      hazard.rawEvents[0].arrivedAtMH.substring(0, 10) : 'No hazard time found'}`,
    hazardDetails: `Shield Id: ${hazard.shieldId}`,
    locationType: ' GeoJson',
    locations: `${(hazard.rawEvents) ?
      JSON.stringify(hazard.rawEvents.map(event => event.location.geometry.coordinates)) : 'No locations found'}`,
    eventsNumber: (hazard.rawEvents) ? hazard.rawEvents.length : 0,
    hazardEvents: `${(hazard.rawEvents) ?
      JSON.stringify(hazard.rawEvents.map(event => event.event)) : 'No events found'}`
  });
}

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
        user: config.email.authUser,
        pass: config.email.authPassword
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
        html: prepareEmailHtml(toUser, payload)
      };
      // send mail with defined transport object
      return this.transporter.sendMail(mailOptions).then((info) => {
        console.log('Message %s sent: %s', info.messageId, info.response);
      });
    });
  }
};
