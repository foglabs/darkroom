/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	login: function(req, res){
    return res.view('login', {error: ""});
  },

  auth: function(req, res){
    var nm = req.body.nm;
    var pw = req.body.pw;
    var bee = require('bcrypt');

    User.findOne({name: nm}).exec(function(err, user) {
      if(err){
        return;
      }

      bee.compare(pw, user.password, function(err, matches) {
          // matches === true

          if(matches === true){
            return res.view('homepage');
          } else {
            return res.view('login', {error: 'Invalid Credentials'});
          }
      });

    });
    
  }
};

