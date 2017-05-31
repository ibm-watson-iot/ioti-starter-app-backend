/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict';

class CloudantError extends Error {

  constructor(err) {
    super(err.error + ' - ' + err.reason + `\n (${JSON.stringify(err.req)})`);
    Error.captureStackTrace(this, CloudantError);
    this.name = this.constructor.name;
    this.details = err;
  }
}

class CloudantNegativeResponse extends Error {

  constructor(err) {
    super(err.error + ' - ' + err.reason + `\n (${JSON.stringify(err.req)})`);
    Error.captureStackTrace(this, CloudantNegativeResponse);
    this.name = this.constructor.name;
    this.details = err;
  }
}


module.exports = {
  CloudantError: CloudantError,
  CloudantNegativeResponse: CloudantNegativeResponse
};
