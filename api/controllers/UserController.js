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
          return res.redirect('/');
        }

        console.log(user)

        bee.compare(pw, user.password, function(err, matches) {
          if(matches === true){

            var tokenlib = require('hash-auth-token')( process.env.DARKROOM_SECRET );

            // user login token (user id)
            var usertoken = tokenlib.generate({userid: user.id}, 3600);

            var hashme = user.identity + ':' + process.env.IDENTITY_SECRET;
            
            var CryptoJS = require('crypto-js');
            
            var decrypted_salt = CryptoJS.AES.decrypt(user.identity_salt, process.env.DARKROOM_SECRET).toString(CryptoJS.enc.Utf8); 

            console.log(decrypted_salt)

            bee.hash(hashme, decrypted_salt, function(err, identhash) {
              
              // recreate my hot hash
              req.session.identity = identhash;

              // who we is
              req.session.userid = user.id;

              return res.cookie('authed', usertoken, {signed: true}).redirect('/');
            });

          } else {
            return res.view('login', {error: 'Invalid Credentials'});
          }
        });

      });
    }
    
  },

  logout: function(req, res) {
    req.session.destroy();
    return res.clearCookie('authed').redirect('/login');
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