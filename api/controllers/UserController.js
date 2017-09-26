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
          if(matches === true){

            // get tokenlib and then generate new token for this user
            var tokenlib = require('hash-auth-token')( process.env.DARKROOM_SECRET );

            // user login token (user id)
            var usertoken = tokenlib.generate({userid: user.id}, 3600);

            // recreate encrypted identity with user's secret
            var ident = require('crypto-js').AES.encrypt(user.secret, process.env.DARKROOM_SECRET).toString();
            req.session.identity = ident;

            // who we is
            req.session.userid = user.id;

            return res.cookie('authed', usertoken, {signed: true}).redirect('/');
          } else {
            return res.view('login', {error: 'Invalid Credentials'});
          }
        });

      });
    }
    
  }
};

// res.cookie(name, value [,options]);

// other option for carrying ident
// .cookie('identity', ident, {signed: true})




// var CryptoJS = require("crypto-js");
 
// // Encrypt 
// var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123');
 
// // Decrypt 
// var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
// var plaintext = bytes.toString(CryptoJS.enc.Utf8);
 
// console.log(plaintext);