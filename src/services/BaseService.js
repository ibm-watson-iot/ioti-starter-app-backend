'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const logger = require('../utils/Logger');

class BaseService {

  constructor(store, docType) {
    this.store = store;
    this.docType = docType;
  }

  get(tid, user, docId) {
    const method = 'BaseService.get';
    logger.info(tid, method, 'Getting a', this.docType);
    return this.store.get(tid, docId);
  }

  list(tid, user, queryOptions) {
    const method = 'BaseService.list';
    logger.info(tid, method, 'Listing', this.docType);
    return this.store.list(tid, queryOptions);
  }

  create(tid, user, newDoc) {
    const method = 'BaseService.create';
    logger.info(tid, method, 'Creating a', this.docType);
    return this.store.create(tid, newDoc);
  }

  update(tid, user, docToUpdate) {
    const method = 'BaseService.update';
    logger.info(tid, method, 'Updating a', this.docType);
    return this.store.update(tid, docToUpdate);
  }

  save(tid, user, doc) {
    const method = 'BaseService.save';
    logger.info(tid, method, 'Saving a', this.docType);
    return this.store.save(tid, doc);
  }

  delete(tid, user, docId) {
    const method = 'BaseService.delete';
    logger.info(tid, method, 'Deleting a', this.docType);
    return this.store.delete(tid, docId);
  }

}

module.exports = BaseService;
