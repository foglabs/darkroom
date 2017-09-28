/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'text',
      unique: true
    },
    password: {
      type: 'text',
      unique: true
    },
    secret: {
      type: 'text',
      unique: true
    },
    identity: {
      type: 'text',
      unique: true
    },
    identity_salt: {
      type: 'text'
    },



    dope: {
      type: 'integer',
      default: 1
    },

    pic: {
      type: 'text'
    },
    bio: {
      type: 'text'
    },
  }



};

