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
const logger = require('../utils/logger');
const BaseController = require('./BaseController');
const UserService = require('../services/UserService');

const CLOUDANT_ERROR = 'CloudantNegativeResponse';

class UserController extends BaseController {

  constructor(config, router) {
    const service = new UserService(config);
    super(service);
    this.claimService = service;
    this.basePath = '/' + service.docType + 's';

    router.get(this.basePath, this.list.bind(this));
    router.post(this.basePath, this.create.bind(this));
    router.get(this.basePath + '/:userId', this.get.bind(this));
    router.post(this.basePath + '/:userId', this.update.bind(this));
    router.put(this.basePath + '/:userId', this.update.bind(this));
    router.delete(this.basePath + '/:userId', this.delete.bind(this));
  }

  list(req, res) {
    const tid = uuidV4();
    const method = 'UserController.list';
    const user = req.user;
    const queryOptions = {};
    queryOptions.skip = req.query.skip;
    queryOptions.limit = req.query.limit;
    queryOptions.includeDocs = req.query.includeDocs;
    queryOptions.descending = req.query.descending;
    logger.info(tid, method, 'Access to GET', req.originalUrl);

    return this.isAdmin(req, 'read').then((ok) => {
      if (!ok) {
        return this.service.get(tid, user, user).then((userDoc) => {
          return { offset: 0, limit: 100, totalItems: 1, items: [userDoc] };
        });
      }
      return this.service.list(tid, user, queryOptions);
    })
      .then((results) => {
        res.send(results);
      })
      .catch((err) => {
        console.log(err);
        if (err.name === CLOUDANT_ERROR) {
          const error = JSON.parse(err.details.error);
          error.statusCode = err.details.statusCode;
          res.status(err.details.statusCode).json(error);
        } else {
          res.status(500).json({ statusCode: 500, error: 'Internal Server Error' });
        }
      });
  }

}

let instance;

module.exports = {
  init: (config, router) => {
    instance = new UserController(config, router);
    return instance;
  }
};
