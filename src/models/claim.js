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
  id: '/Claim',
  type: 'object',
  properties: {
    policyId: {
      type: 'string'
    },
    policyName: {
      type: 'string'
    },
    policyHolderName: {
      type: 'string'
    },
    hazardId: {
      type: 'string'
    },
    damageIncurred: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    claimFiled: {
      type: 'boolean'
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
