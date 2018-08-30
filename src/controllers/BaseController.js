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

  isAdmin(req) {
    const user = req.user;
    if (req.scopes.includes('admin') || req.includes('admin:write:' + this.service.docType)) {
      return Promise.resolve(true);
    }
    return this.service.get('', user, user)
      .then((userDoc) => {
        return userDoc.accessLevel == 3;
      });
  }

  get(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.get';
    const user = req.user;
    const docId = req.params[this.service.docType + 'Id'];
    logger.info(tid, method, 'Access to GET', req.originalUrl);

    this.service.get(tid, user, docId)
      .then((results) => {
        if (user !== docId && user !== results.userId) {
          return this.isAdmin(req).then((ok) => ok ? results : false);
        }
        return results;
      })
      .then((results) => {
        if (!results) {
          res.send(403, {message: 'You need admin rights'});
          return
        }
        res.send(results);
      })
      .catch((err) => {
        if (err.name === CLOUDANT_ERROR) {
          const error = JSON.parse(err.details.error);
          error.statusCode = err.details.statusCode;
          res.status(err.details.statusCode).json(error);
        } else {
          res.status(500).json({ statusCode: 500, error: 'Internal Server Error' });
        }
    });
  }

  list(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.list';
    const user = req.user;
    const queryOptions = {};
    queryOptions.skip = req.query.skip;
    queryOptions.limit = req.query.limit;
    queryOptions.includeDocs = req.query.includeDocs;
    queryOptions.descending = req.query.descending;
    logger.info(tid, method, 'Access to GET', req.originalUrl);

    this.service.list(tid, user, queryOptions).then((results) => {
      res.send(results);
    }).catch((err) => {
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

  create(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.create';
    const user = req.user;
    const doc = req.body;
    logger.info(tid, method, 'Access to POST', req.originalUrl);

    this.isAdmin(req)
      .then((isAdmin) => {
        if (!isAdmin) {
          return
        }
        return this.service.create(tid, user, doc);
      })
      .then((result) => {
        if (!result) {
          res.send(403, {message: 'You need admin rights'});
          return;
        }
        res.status(201).send(result);
      })
      .catch((err) => {
        if (err.name === CLOUDANT_ERROR) {
          const error = JSON.parse(err.details.error);
          error.statusCode = err.details.statusCode;
          res.status(err.details.statusCode).json(error);
        } else {
          res.status(500).json({ statusCode: 500, error: 'Internal Server Error' });
        }
    });
  }

  update(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.update';
    const user = req.user;
    const doc = req.body;
    const docId = req.params[this.service.docType + 'Id'];
    logger.info(tid, method, 'Access to POST', req.originalUrl);
    doc._id = docId;

    this.service.get(tid, user, docId)
      .then((results) => {
        if (user !== docId && user !== results.userId) {
          return this.isAdmin(req).then((ok) => ok ? results : false);
        }
        return results;
      })
      .then((results) => {
        if (!results) {
          res.send(403, {message: 'You need admin rights'});
          return
        }
        return this.service.update(tid, user, doc).then((result) => {
          res.send(result);
        });
      })
      .catch((err) => {
        if (err.name === CLOUDANT_ERROR) {
          const error = JSON.parse(err.details.error);
          error.statusCode = err.details.statusCode;
          res.status(err.details.statusCode).json(error);
        } else {
          res.status(500).json({ statusCode: 500, error: 'Internal Server Error' });
        }
      });
  }

  save(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.save';
    const user = req.user;
    const docToSave = req.body;
    const docId = req.params[this.service.docType + 'Id'];
    docToSave._id = docId;
    logger.info(tid, method, 'Access to PUT', req.originalUrl);

    this.service.get(tid, user, docId)
      .then((results) => {
        if (user !== docId && user !== results.userId) {
          return this.isAdmin(req).then((ok) => ok ? results : false);
        }
        return results;
      })
      .then((results) => {
        if (!results) {
          res.send(403, {message: 'You need admin rights'});
          return
        }
        return this.service.save(tid, user, docToSave).then((results) => {
          res.send(results);
        })
      })
      .catch((err) => {
        if (err.name === CLOUDANT_ERROR) {
          const error = JSON.parse(err.details.error);
          error.statusCode = err.details.statusCode;
          res.status(err.details.statusCode).json(error);
        } else {
          res.status(500).json({ statusCode: 500, error: 'Internal Server Error' });
        }
      });
  }

  delete(req, res) {
    const tid = uuidV4();
    const method = 'BaseController.delete';
    const user = req.user;
    const docId = req.params[this.service.docType + 'Id'];
    logger.info(tid, method, 'Access to DELETE', req.originalUrl);

    this.service.get(tid, user, docId)
      .then((results) => {
        if (this.service.docType === 'user' && user !== results.userId) {
          return this.isAdmin(req).then((ok) => ok ? results : false);
        }
        return results;
      })
      .then((results) => {
        if (!results) {
          res.send(403, {message: 'You need admin rights'});
          return
        }
        return this.service.delete(tid, user, docId).then((results) => {
          res.status(202).send(results);
        });
      })
      .catch((err) => {
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

module.exports = BaseController;
