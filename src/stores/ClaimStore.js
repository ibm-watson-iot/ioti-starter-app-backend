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

class ClaimStore extends BaseStore {

  constructor(dbName, dbCredentials) {
    super(dbName, dbCredentials);
    this.dbName = dbName;
  }

  getClaimsByUsername(username) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.selectByAttribute('policyHolderName', username)
      .then((result) => {
        if (result && result.docs && (result.docs.length > 0)) {
          resolve(result.docs);
        } else if (result && result.docs && (result.docs.length === 0)) {
          resolve([]);
        } else {
          reject(new Error('There is not any claims with username ' + username));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getClaimsByHazardId(hazardId) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.selectByAttribute('hazardId', hazardId)
      .then((result) => {
        if (result && result.docs && (result.docs.length > 0)) {
          resolve(result.docs);
        } else if (result && result.docs && (result.docs.length === 0)) {
          resolve([]);
        } else {
          reject(new Error('There is not any claims with hazardId ' + hazardId));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = ClaimStore;
