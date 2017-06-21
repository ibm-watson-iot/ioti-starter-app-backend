'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const BaseController = require('./BaseController');
const UserService = require('../services/UserService');

class UserController extends BaseController {

  constructor(config, router) {
    const service = new UserService(config);
    super(service);
    this.claimService = service;
    this.basePath = '/' + service.docType + 's';

    router.get(this.basePath, this.list.bind(this));
    router.get(this.basePath + '/:userId', this.get.bind(this));
    router.post(this.basePath, this.create.bind(this));
    router.put(this.basePath + '/:userId', this.update.bind(this));
    router.delete(this.basePath + '/:userId', this.delete.bind(this));
  }

}

let instance;

module.exports = {
  init: (config, router) => {
    instance = new UserController(config, router);
    return instance;
  }
};
