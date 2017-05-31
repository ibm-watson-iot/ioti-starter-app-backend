/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict';

/*
This is a copy of the cloudant package retry plugin. It was changed to return promises,
as such streaming support has been moved to improved-retry-stream plugin

This the the 'retry' request handler. If CouchDB/Cloudant responds with a
429 HTTP code the library will retry the request up to three times with
exponential backoff. This module is unsuitable for streaming requests.
*/


const async = require('async');
const debug = require('debug')('cloudant');
const Promise = require('bluebird');
const errors = require('./errors');

module.exports = function(options) {
  const nullcallback = function() {};
  const requestDefaults = options.requestDefaults || { jar: false };
  const request = require('request').defaults(requestDefaults);

  const myrequest = function(req, callback) {
    const maxAttempts = options.retryAttempts || 3;
    const firstTimeout = options.retryTimeout || 500; // ms
    let attempts = 0;
    let timeout = 0; // ms
    let statusCode = null;

    if (typeof callback !== 'function') {
      callback = nullcallback;
    }

    // do the first function until the second function returns true
    async.doUntil((done) => {
      statusCode = 500;
      attempts += 1;
      if (attempts >= 1) {
        debug('attempt', attempts, 'timeout', timeout);
      }
      setTimeout(() => {
        request(req, (e, h, b) => {
          done(null, [e, h, b]);
        }).on('response', (r) => {
          statusCode = (r && r.statusCode) || 500;
        });
      }, timeout);
    }, () => {
      // this function returns false for the first 'maxAttempts' 429s receieved
      if (statusCode === 429 && attempts < maxAttempts) {
        if (attempts === 1) {
          timeout = firstTimeout;
        } else {
          // CHANGE: Multiple requests was getting delayed with same timeout
          timeout += Math.floor(Math.random() * timeout);
        }
        return false;
      }
      return true;
    }, (e, results) => {
      callback(results[0], results[1], results[2]);
    });
  };

  return function(req, callback) {
    return new Promise((resolve, reject) => {
      myrequest(req, (err, h, res) => {
        const statusCode = (h && h.statusCode) || 500;
        let b;
        if (res) {
          try {
            b = JSON.parse(res);
          } catch (er) {
            b = {};
          }
        }
        if (statusCode >= 200 && statusCode < 400) {
          if (callback) callback(err, h, b);
          return resolve(b);
        }
        if (b) {
          b.error = res;
          b.reason = '';
          b.statusCode = statusCode;
          b.req = req;
        }
        if (callback) callback(err, h, b);
        if (err) {
          reject(new Error(err));
          return null;
        }
        if (statusCode >= 500 || statusCode < 200) {
          reject(new errors.CloudantError(b));
        } else {
          reject(new errors.CloudantNegativeResponse(b));
        }
        return null;
      });
    });
  };
};
