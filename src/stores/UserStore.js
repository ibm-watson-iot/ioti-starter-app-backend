'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const BaseStore = require('./BaseStore');

class UserStore extends BaseStore {

  constructor(dbName, dbCredentials) {
    super(dbName, dbCredentials);
    this.dbName = dbName;
  }

}

module.exports = UserStore;
