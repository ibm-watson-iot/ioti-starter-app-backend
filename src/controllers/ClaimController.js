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
const ClaimService = require('../services/ClaimService');

const CLOUDANT_ERROR = 'CloudantNegativeResponse';

class ClaimController extends BaseController {

  constructor(config, router) {
    const service = new ClaimService(config);
    super(service);
    this.claimService = service;
    this.basePath = '/' + service.docType + 's';

    router.get(this.basePath, this.list.bind(this));
    router.get(this.basePath + '/:claimId', this.get.bind(this));
    router.post(this.basePath, this.create.bind(this));
    router.put(this.basePath + '/:claimId', this.update.bind(this));
    router.delete(this.basePath + '/:claimId', this.delete.bind(this));
  }

  list(req, res) {
    const tid = uuidV4();
    const method = 'ClaimController.list';
    const user = undefined;
    const queryOptions = {};
    queryOptions.skip = req.query.skip;
    queryOptions.limit = req.query.limit;
    queryOptions.includeDocs = req.query.includeDocs;
    queryOptions.descending = req.query.descending;
    const hazardId = req.query.hazardId;
    const userId = req.query.userId;
    logger.info(tid, method, 'Access to GET', req.originalUrl);

    let promise;
    if (hazardId) {
      promise = this.claimService.listByHazardId(tid, user, hazardId, queryOptions);
    } else if (userId) {
      promise = this.claimService.listByUserId(tid, user, userId, queryOptions);
    } else {
      promise = this.claimService.list(tid, user, queryOptions);
    }

    promise.then((claims) => {
      res.send(claims);
    }).catch((err) => {
      if (err.name === CLOUDANT_ERROR) {
        res.status(err.details.statusCode).json({ message: err.details.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  }

}

let instance;

module.exports = {
  init: (config, router) => {
    instance = new ClaimController(config, router);
    return instance;
  }
};
