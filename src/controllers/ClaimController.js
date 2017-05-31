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
const ClaimService = require('../services/ClaimService');

class ClaimController extends BaseController {

  constructor(config, router) {
    const service = new ClaimService(config);
    super(service);
    this.claimService = service;
    this.basePath = '/' + service.docType + 's';

    router.get(this.basePath, this.list.bind(this));
    router.get(this.basePath + '/:claimId', this.get.bind(this));
    router.get(this.basePath + '/user/:username', this.getClaimsByUsername.bind(this));
    router.get(this.basePath + '/hazard/:hazardId', this.getClaimsByHazardId.bind(this));
    router.post(this.basePath, this.create.bind(this));
    router.put(this.basePath, this.update.bind(this));
    router.delete(this.basePath, this.delete.bind(this));
  }

  getClaimsByUsername(req, res) {
    const method = 'ClaimController.getClaimsByUsername';
    const path = 'GET ' + this.basePath + '/user/' + req.params.username;
    console.info(method, 'Access to', path);

    const username = req.params.username;
    if (!username) {
      res.status(400).json({ error: 'username not given' });
    } else {
      this.claimStore.getClaimsByUsername(username).then((docs) => {
        res.send(docs);
      }).catch((err) => {
        res.status(502).json({ error: err.message });
      });
    }
  }

  getClaimsByHazardId(req, res) {
    const method = 'ClaimController.getClaimsByUsername';
    const path = 'GET ' + this.basePath + '/hazard/' + req.params.hazardId;
    console.info(method, 'Access to', path);

    const hazardId = req.params.hazardId;
    if (!hazardId) {
      res.status(400).json({ error: 'hazardId not given' });
    } else {
      this.claimStore.getClaimsByHazardId(hazardId).then((docs) => {
        res.send(docs);
      }).catch((err) => {
        res.status(502).json({ error: err.message });
      });
    }
  }
}

module.exports = ClaimController;
