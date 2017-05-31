'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const BaseService = require('./BaseService');
const UserStore = require('../stores/UserStore');

class UserService extends BaseService {

  constructor(config) {
    const docType = 'user';
    const store = new UserStore(config.dbName, config.dbCredentials);
    super(store, docType);
  }

}

module.exports = UserService;
