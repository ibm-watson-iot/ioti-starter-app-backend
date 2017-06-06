'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const logger = require('../utils/logger');
const BaseService = require('./BaseService');
const ClaimStore = require('../stores/ClaimStore');

class ClaimService extends BaseService {

  constructor(config) {
    const docType = 'claim';
    const store = new ClaimStore(config.dbName, config.dbCredentials);
    super(store, docType);
  }

  listByHazardId(tid, user, hazardId, queryOptions) {
    const method = 'ClaimService.listByHazardId';
    logger.info(tid, method, 'Listing claims by shieldId.');
    return this.store.queryViewProperty(tid, 'hazardId', hazardId, queryOptions);
  }

  listByUserdId(tid, user, userId, queryOptions) {
    const method = 'ClaimService.listByUserdId';
    logger.info(tid, method, 'Listing claims by userId.');
    return this.store.queryViewProperty(tid, 'userId', userId, queryOptions);
  }

}

module.exports = ClaimService;
