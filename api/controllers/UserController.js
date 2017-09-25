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

    if(nm && pw){

      User.findOne({name: nm}).exec(function(err, user) {
        if(err){
          return;
        }

        bee.compare(pw, user.password, function(err, matches) {
            // matches === true

            if(matches === true){

              // get tokenlib and then generate new token for this user
              var tokenlib = require('hash-auth-token')( process.env.DARKROOM_SECRET );
              var token = tokenlib.generate({user: nm}, 3600);

              return res.cookie('authed', token, {signed: true}).view('homepage');
            } else {
              return res.view('login', {error: 'Invalid Credentials'});
            }
        });

      });
    }
    
  }
};

// res.cookie(name, value [,options]);