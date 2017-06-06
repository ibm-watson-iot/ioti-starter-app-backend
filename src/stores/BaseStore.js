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
const Cloudant = require('cloudant');
const pluralize = require('pluralize');
const utils = require('../utils/utils');
const logger = require('../utils/logger');
const improvedRetry = require('../utils/improved-retry.js');

class BaseStore {

  constructor(dbName, dbCredentials) {
    const method = 'BaseStore.constructor';
    this.limit = 20;
    this.maxLimit = 100;
    this.designName = 'iot4i';
    const camelToDash = function(s) {
      return s.replace(/([A-Z])/g, ($1, p1, pos) => (pos > 0 ? '-' : '') + $1.toLowerCase());
    };
    const dashed = camelToDash(this.constructor.name);
    this.docType = dashed.split('-').slice(0, -1).join('-');
    this.propertyViews = {};
    this.mapViews = {};

    try {
      this.validator = require(`../models/${this.docType}.js`);
    } catch (e) {
      this.validator = {
        validate() {}
      };
    }

    const noTid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    logger.debug(noTid, method, 'Creating connection for database.');
    const cloudantDB = Cloudant({
      account: dbCredentials.username,
      key: dbCredentials.username,
      password: dbCredentials.password,
      plugin: improvedRetry({ retryAttempts: 10 })
    });
    this.db = cloudantDB.db.use(dbName);
    if (!this.db) {
      logger.error(noTid, method, 'Database', dbName, 'not found.');
      throw Error('Database', dbName, 'not found.');
    }
  }

  get(tid, documentId) {
    const method = 'BaseStore.get';
    logger.info(tid, method, 'Getting',
      this.docType, 'document with an id', documentId);

    return this.db.get(documentId).then((document) => {
      logger.info(tid, method, 'Found', this.docType,
        'document in database with an id', documentId);
      return document;
    });
  }

  list(tid, queryOptions) {
    const method = 'BaseStore.list';
    queryOptions = Object.assign({
      skip: 0,
      limit: 100,
      includeDocs: true
    }, queryOptions);
    let { skip, limit, includeDocs, descending } = queryOptions;
    if ((typeof includeDocs === 'undefined') || (includeDocs === null)) {
      includeDocs = true;
    }
    if ((typeof skip === 'undefined') || (skip === null)) {
      skip = 0;
    }
    if ((typeof limit === 'undefined') || (limit === null)) {
      limit = this.limit;
    } else if (limit > this.maxLimit) {
      limit = this.maxLimit;
    }
    logger.info(tid, method, 'Listing', this.docType,
      'documents with skipping', skip, 'documents and a limit', limit);

    const viewOptions = {
      include_docs: includeDocs,
      descending: descending,
      limit: limit,
      skip: skip
    };
    const viewName = pluralize(this.docType);

    return this.db.view(this.designName, viewName, viewOptions)
      .then((resultOfView) => {
        const result = {
          offset: skip,
          limit: limit,
          totalItems: resultOfView.total_rows,
          items: []
        };
        resultOfView.rows.forEach((row) => {
          if (row.doc._id.indexOf('_design') !== 0) {
            result.items.push(row.doc);
          }
        });
        logger.info(tid, method, result.items.length,
            this.docType, 'documents are found.');
        return result;
      });
  }

  create(tid, newDocument) {
    const method = 'BaseStore.create';
    logger.info(tid, method, 'Creating new', this.docType, 'document');
    if (!(newDocument._id && utils.isValidUuidv4(newDocument._id))) {
      newDocument._id = uuidV4();
    }
    newDocument.createdAt = Date.now();
    newDocument.updatedAt = newDocument.createdAt;
    newDocument.docType = this.docType;

    this.validator.validate(newDocument);

    return this.db.insert(newDocument).then((result) => {
      logger.info(tid, method, 'Inserted', this.docType, 'document with an id', result.id);
      newDocument._id = result.id;
      newDocument._rev = result.rev;
      return newDocument;
    });
  }

  updatePartial(tid, partialDoc) {
    const method = 'BaseStore.updatePartial';
    logger.info(tid, method, 'Updating Partial',
      this.docType, 'document with an id', partialDoc._id);

    partialDoc.updatedAt = Date.now();
    partialDoc.docType = this.docType;

    const docPromise = this.get(tid, partialDoc._id);

    return docPromise.then((doc) => {
      Object.assign(doc, partialDoc);
      this.validator.validate(doc);
      return this.db.insert(doc, doc._id);
    }, (err) => {
      return Promise.reject(err);
    })
    .then((result) => {
      logger.info(tid, method, 'Updated Partial',
        this.docType, 'document with id', result.id);
      return this.get(tid, partialDoc._id);
    });
  }

  update(tid, documentToUpdate) {
    const method = 'BaseStore.save';
    logger.info(tid, method, 'Updating',
      this.docType, 'document with an id', documentToUpdate._id);
    documentToUpdate.updatedAt = Date.now();
    documentToUpdate.docType = this.docType;
    this.validator.validate(documentToUpdate);

    const docPromise = this.get(tid, documentToUpdate._id);

    return docPromise.then((document) => {
      documentToUpdate._rev = document._rev;
      return this.db.insert(documentToUpdate, documentToUpdate._id);
    }, (err) => {
      return Promise.reject(err);
    })
    .then((result) => {
      logger.info(tid, method, 'Updated', this.docType, 'document with id', result.id);
      return documentToUpdate;
    });
  }

  delete(tid, documentId) {
    const method = 'BaseStore.delete';
    logger.info(tid, method, 'Deleting',
      this.docType, 'document with id', documentId);

    const docPromise = this.get(tid, documentId);

    return Promise.all([docPromise])
      .then(([document]) => this.db.destroy(document._id, document._rev))
      .then((result) => {
        logger.info(tid, method, 'Deleted', this.docType, 'document with id', documentId);
        return result;
      });
  }

  queryViewProperty(tid, propertyName, propertyValue, queryOptions) {
    let viewName = this.propertyViews[propertyName];
    viewName = pluralize(this.docType) + '_' + viewName;
    return this.queryView(tid, viewName, propertyValue, queryOptions);
  }

  queryViewMap(tid, propertyName, propertyValue, queryOptions) {
    let viewName = this.mapViews[propertyName];
    viewName = this.docType + '_' + viewName;
    return this.queryView(tid, viewName, propertyValue, queryOptions);
  }

  queryView(tid, viewName, property, queryOptions) {
    if (property !== undefined) {
      queryOptions = Object.assign({
        startKey: [property],
        endKey: [property, {}],
      }, queryOptions);
    }
    queryOptions = Object.assign({
      skip: 0,
      limit: 100,
      includeDocs: true,
      descending: false
    }, queryOptions);
    let { startKey, endKey, skip, limit, includeDocs, descending } = queryOptions;
    const method = 'BaseStore.queryView';
    if ((typeof skip === 'undefined') || (skip === null)) {
      skip = 0;
    }
    if ((typeof limit === 'undefined') || (limit === null)) {
      limit = this.limit;
    } else if (limit > this.maxLimit) {
      limit = this.maxLimit;
    }

    if (descending === true) {
      [startKey, endKey] = [endKey, startKey];
    }

    logger.info(tid, method, 'Querying', this.docType,
      'documents', 'viewName:', viewName, 'between', startKey, 'and', endKey,
      'Skip:', skip, 'Limit:', limit, 'includeDocs:', includeDocs, 'descending:', descending);

    const viewOptions = {
      skip: skip,
      limit: limit,
      include_docs: includeDocs,
      descending: descending,
      reduce: false,
      group: false
    };
    if (startKey !== undefined) {
      viewOptions.startKey = startKey;
    }
    if (endKey !== undefined) {
      viewOptions.endKey = endKey;
    }
    return this.db.view(this.designName, viewName, viewOptions)
      .then((resultOfView) => {
        const result = {
          offset: skip,
          limit: limit,
          totalItems: 0,
          items: []
        };
        resultOfView.rows.forEach((row) => {
          result.items.push(row);
        });
        if (result.items.length <= limit) {
          result.totalItems = result.items.length;
        }
        logger.info(tid, method, result.items.length, this.docType, 'documents are found.');
        return result;
      });
  }

}

module.exports = BaseStore;
