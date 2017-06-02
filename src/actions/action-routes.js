'use strict';


const express = require('express');
const appConfig = require('../utils/AppConfig').config;


const router = express.Router();

const actions = {
  // 'email-action': require('./email-action'),
  // 'phone-call-action': require('./phone-call-action'),
  // 'send-sms-action': require('./send-sms-action'),
  // 'push-action': require('./push-action')
};


/**
 * initialize all actions
 */
Object.keys(actions).forEach((action) => {
  actions[action].init(appConfig);
});

/**
 * setup routes for each action
 */
Object.keys(actions).forEach((action) => {
  router.post(`/${action}`, (req, res) => {
    this.actions[action].performAction(req.body)
      .then(() => {
        res.send({ processed: true });
      }).catch((err) => {
        res.send({ processed: false, err: err });
      });
  });
});

module.exports = router;
