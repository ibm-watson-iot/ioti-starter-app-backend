'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const uuidV4 = require('uuid/v4');
const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./src/utils/Logger');
let config = require('./config/config-dev.json');
const UserController = require('./src/controllers/UserController');
const ClaimController = require('./src/controllers/ClaimController');

const props = {
  appInfo: {},
  appPort: 4000,
  appHost: 'localhost',
  dbCredentials: undefined,
  claimsDbName: 'claims'
};
const noTid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
config = require('./appConfig.js').getConfig(props);

process.on('uncaughtException', (err) => {
  const errorId = uuidV4();
  const method = 'uncaughtException';
  logger.error(noTid, method, 'Uncaught error. Error id', errorId, 'Stack:', err.stack);
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// RAS endpoint
app.get('/ping', (req, res) => {
  res.send({ msg: 'pong' });
});

app.get('/healthz', (req, res) => {
  logger.info(noTid, 'healthz', 'healthz is called.');
  res.send({ msg: 'pong' });
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
  next();
});

const apiRouter = express.Router();
app.use('/api/v1', apiRouter);

const userEndpoint = new UserController(config, apiRouter);
const claimEndpoint = new ClaimController(config, apiRouter);

const server = app.listen(config.port, () => {
  const port = server.address().port;
  let host = server.address().address;
  host = (host === '::' ? 'localhost' : host);
  logger.info(noTid, 'app.listen', 'Backend is running at', 'https://' + host + ':' + port);
});
