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

const setup = require('./src/utils/setup');
const logger = require('./src/utils/logger');
const AppConfig = require('./src/utils/AppConfig');
const UserController = require('./src/controllers/UserController');
const ClaimController = require('./src/controllers/ClaimController');

const requiredProperties = {
  port: 10050,
  actions: undefined,
  dbCredentials: undefined,
  dbName: 'iot4i-starter-app-db'
};
const noTid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

const env = process.env.APP_ENV || 'dev';
const configFilePath = `./config/config-${env}.json`;
const appConfig = AppConfig.loadConfig(requiredProperties, require(configFilePath));

process.on('uncaughtException', (err) => {
  const errorId = uuidV4();
  const method = 'uncaughtException';
  logger.error(noTid, method, 'Uncaught error. Error id', errorId, 'Stack:', err.stack);
});

// global app required in websocket-action
express.app = express();
const app = express.app;
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
app.use('/api/v1/actions', require('./src/actions/action-routes'));

UserController.init(appConfig, apiRouter);
ClaimController.init(appConfig, apiRouter);

setup.createDatabase(appConfig.dbCredentials, appConfig.dbName).then(() => {
  const server = app.listen((process.env.PORT || appConfig.port), () => {
    const method = 'app.listen';
    const port = server.address().port;
    const host = (`${server.address().address === '::' ? 'localhost' : server.address().address}`);
    logger.info(noTid, method, 'Starter-app-backend is starting at', `https://${host}:${port}`);
  });
  // for websocket action
  app.server = server;
}).catch((err) => {
  logger.error(noTid, 'app.init', 'Database creation is failed.');
});
