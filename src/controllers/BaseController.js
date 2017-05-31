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

const CLOUDANT_ERROR = 'CloudantNegativeResponse';

class BaseController {

  constructor(service) {
    this.service = service;
  }

  get(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.get';
    const user = undefined;
    const docId = req.params[this.service.docType + 'Id'];
    logger.info(tid, method, 'Access to GET', req.originalUrl);

    this.service.get(tid, user, docId).then((results) => {
      res.send(results);
    }).catch((err) => {
      if (err.name === CLOUDANT_ERROR) {
        res.status(err.details.statusCode).json({ message: err.details.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  }

  list(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.list';
    const user = undefined;
    const queryOptions = {};
    queryOptions.skip = req.params.skip;
    queryOptions.limit = req.params.limit;
    queryOptions.includeDocs = req.params.includeDocs;
    queryOptions.descending = req.params.descending;
    logger.info(tid, method, 'Access to GET', req.originalUrl);

    this.service.list(tid, user, queryOptions).then((results) => {
      res.send(results);
    }).catch((err) => {
      console.log(err);
      if (err.name === CLOUDANT_ERROR) {
        res.status(err.details.statusCode).json({ message: err.details.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  }

  create(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.create';
    const user = undefined;
    const doc = req.params[this.service.docType];
    logger.info(tid, method, 'Access to POST', req.originalUrl);

    this.service.create(tid, user, doc).then((result) => {
      res.status(201).send(result);
    }).catch((err) => {
      if (err.name === CLOUDANT_ERROR) {
        res.status(err.details.statusCode).json({ message: err.details.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  }

  update(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.update';
    const user = undefined;
    const doc = req.params[this.service.docType];
    const docId = req.params[this.service.docType + 'Id'];
    logger.info(tid, method, 'Access to POST', req.originalUrl);
    doc._id = docId;

    this.service.update(tid, user, doc).then((result) => {
      res.send(result);
    }).catch((err) => {
      if (err.name === CLOUDANT_ERROR) {
        res.status(err.details.statusCode).json({ message: err.details.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  }

  save(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.save';
    const user = undefined;
    const docToSave = req.params[this.service.docType];
    const docId = req.params[this.service.docType + 'Id'];
    docToSave._id = docId;
    logger.info(tid, method, 'Access to PUT', req.originalUrl);

    this.service.save(tid, user, docToSave).then((results) => {
      res.send(results);
    }).catch((err) => {
      if (err.name === CLOUDANT_ERROR) {
        res.status(err.details.statusCode).json({ message: err.details.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  }

  delete(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.delete';
    const user = undefined;
    const docId = req.params[this.service.docType + 'Id'];
    logger.info(tid, method, 'Access to DELETE', req.originalUrl);

    this.service.delete(tid, user, docId).then((results) => {
      res.status(202).send(results);
    }).catch((err) => {
      if (err.name === CLOUDANT_ERROR) {
        res.status(err.details.statusCode).json({ message: err.details.error });
      } else {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  }

}

module.exports = BaseController;
