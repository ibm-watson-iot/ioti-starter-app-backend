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
const logger = require('../utils/logger');

class UserStore extends BaseStore {

  constructor(dbName, dbCredentials) {
    super(dbName, dbCredentials);
    this.dbName = dbName;
  }

  transformUser(user) {
    var trimmedUser = {
      _id: user._id,
      _rev: user._rev,
      name: user.name ? user.name : decodeURIComponent(user.cn),
      email: user.email ? user.email : user.emailAddress,
      accessLevel: user.accessLevel,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      address: user.address
    };

    Object.keys(trimmedUser).forEach(key => trimmedUser[key] === undefined ? delete trimmedUser[key] : '');

    return trimmedUser;
  }

  create(tid, user) {
    const method = 'BaseStore.create';
    logger.info(tid, method, 'Creating new', this.docType, 'document');

    var userInfo = this.transformUser(user);

    return super.create(tid, userInfo);
  }

  update(tid, documentToUpdate) {
    const method = 'UserStore.save';
    logger.info(tid, method, 'Updating',
      this.docType, 'document with an id', documentToUpdate._id);

    var userInfo = this.transformUser(documentToUpdate);

    return super.get(tid, documentToUpdate._id)
      .then((document) => {
        return Object.assign(document, userInfo);
      })
      .then((documentToUpdateTrimmed) => {
        return super.update(tid, documentToUpdateTrimmed);
      });
  }

  get(tid, documentId) {
    const method = 'UserStore.get';
    logger.info(tid, method, 'Getting',
      this.docType, 'document with an id', documentId);

    return super.get(tid, documentId).then((document) => {
      return this.transformUser(document);
    });
  }

  list(tid, queryOptions) {
    const method = 'UserStore.list';
    logger.info(tid, method, 'Listing', this.docType, 'documents with skipping');

    return super.list(tid, queryOptions).then((document) => {
        document.items = document.items.map((user) => this.transformUser(user));
      return document;
    });
  }

}

module.exports = UserStore;
