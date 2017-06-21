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
const errors = require('../utils/errors');

class UserService extends BaseService {

  constructor(config) {
    const docType = 'user';
    const store = new UserStore(config.dbName, config.dbCredentials);
    super(store, docType);
  }

  update(tid, user, docToUpdate) {
    return super.update(tid, user, docToUpdate)
    .catch((err) => {
      if (err instanceof errors.CloudantNegativeResponse && err.details.statusCode === 404) {
        return super.create(tid, user, docToUpdate);
      }
      throw err;
    });
  }
}

module.exports = UserService;
