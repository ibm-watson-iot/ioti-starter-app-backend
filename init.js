'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const setup = require('./src/utils/setup');
const AppConfig = require('./src/utils/AppConfig');

const requiredProperties = {
 app: {},
 port: 5000,
 host: 'localhost',
 dbCredentials: undefined,
 dbName: 'iot4i-starter-app-db'
};
const env = process.env.APP_ENV || 'dev';
const configFilePath = `./config/config-${env}.json`;
const appConfig = AppConfig.getConfig(requiredProperties, require(configFilePath));

setup.createDatabase(appConfig.dbCredentials, appConfig.dbName);
