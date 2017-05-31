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
const improvedRetry = require('./improved-retry');
const views = require('../views/starter-app-db-view');

module.exports = {
  createDatabase(credentials, dbname) {
    credentials.plugin = improvedRetry({ retryAttempts: 10 });
    const cloudantDB = cloudant(credentials);
    return cloudantDB.db.create(dbname)
      .then(() => {
        return cloudantDB.use(dbname).insert({
          _id: '_design/iot4i',
          views: views
        });
      });
  }
};
