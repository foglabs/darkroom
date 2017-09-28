/**
 * Thought.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    body: {
      type: 'text',
      required: true
    },
    // this is the revealable user data
    mystery: {
      type: 'text',
      required: true,
    },
    // this is how we identify the logged-in user's posts
    identity: {
      type: 'text',
      required: true,
    },
    rating: {
      type: 'integer',
    }
  }
};
