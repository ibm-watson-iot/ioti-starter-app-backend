'use strict';

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const Validator = require('jsonschema').Validator;

const schema = {
  id: '/User',
  type: 'object',
  properties: {
    username: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    createdAt: {
      type: 'integer',
      format: 'int64'
    },
    updatedAt: {
      type: 'integer',
      format: 'int64'
    }
  }
};

const v = new Validator();

module.exports = {
  schema: schema,
  validator: v,
  validate(user) {
    const result = this.validator.validate(user, this.schema);
    if (!result.valid) {
      throw result.errors;
    }
  }
};
