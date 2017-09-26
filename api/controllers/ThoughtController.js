/**
 * ThoughtController
 *
 * @description :: Server-side logic for managing Thoughts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function(req, res) {
    return res.view('homepage');
  }  	
};

