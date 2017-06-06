/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict';

/* eslint-disable no-undef,no-restricted-syntax,prefer-arrow-callback */
module.exports = {
  claims: {
    map: function(doc) {
      if (doc.docType === 'claim') {
        emit(doc.updatedAt, null);
      }
    }
  },
  claims_by_hazardId: {
    map: function(doc) {
      if (doc.docType === 'claim') {
        emit([doc.hazardId, doc.updatedAt], null);
      }
    }
  },
  claims_by_userId: {
    map: function(doc) {
      if (doc.docType === 'claim') {
        emit([doc.userId, doc.updatedAt], null);
      }
    }
  },
  users: {
    map: function(doc) {
      if (doc.docType === 'user') {
        emit(doc.updatedAt, null);
      }
    }
  }
};
