'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const cloudant = require('cloudant');
const logger = require('./logger');
const improvedRetry = require('./improved-retry');
const views = require('../views/starter-app-db-view');

module.exports = {
  createDatabase(credentials, dbname) {
    const method = 'setup.createDatabase';
    const noTid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    credentials.plugin = improvedRetry({ retryAttempts: 10 });
    const cloudantDB = cloudant(credentials);
    return cloudantDB.db.get(dbname).then((database) => {
      logger.info(noTid, method, 'Database exists. No need to create one.');
      return cloudantDB.use(dbname);
    }).catch((err) => {
      const error = JSON.parse(err.details.error);
      if (error && error.error === 'not_found') {
        logger.info(noTid, method, 'Database does not exist. Creating a database...');
        return cloudantDB.db.create(dbname).then(() => {
          return cloudantDB.use(dbname).insert({
            _id: '_design/iot4i',
            views: views
          });
        });
      } else {
        logger.error(noTid, method, err.details.error);
        throw err;
      }
    });
  }
};
