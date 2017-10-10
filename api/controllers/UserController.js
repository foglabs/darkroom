/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	login: function(req, res){
    return res.view('login', {layout: 'login_layout', error: ""});
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

        // console.log(user)

        bee.compare(pw, user.password, function(err, matches) {
          if(matches === true){

            var tokenlib = require('hash-auth-token')( process.env.DARKROOM_SECRET );

            // user login token (user id)
            var usertoken = tokenlib.generate({userid: user.id}, 3600);

            var hashme = user.identity + ':' + process.env.IDENTITY_SECRET;
            var CryptoJS = require('crypto-js');
            var decrypted_salt = CryptoJS.AES.decrypt(user.identity_salt, process.env.DARKROOM_SECRET).toString(CryptoJS.enc.Utf8); 

            bee.hash(hashme, decrypted_salt, function(err, identhash) {
              
              // recreate my hot hash
              req.session.identity = identhash;

              // who we is
              req.session.userid = user.id;

              return res.cookie('authed', usertoken, {signed: true}).redirect('/');
            });

          } else {
            return res.view('login', {layout: 'login_layout', error: 'Invalid Credentials'});
          }
        });

      });
    }
    
  },

  logout: function(req, res) {
    req.session.destroy();
    return res.clearCookie('authed').redirect('/login');
  },

  invited: function(req, res) {
    var CryptoJS = require('crypto-js');
    
    var authcode = req.query.au;
    var authpieces = CryptoJS.AES.decrypt(authcode, process.env.INVITE_SECRET).toString(CryptoJS.enc.Utf8).split(":");
    var email = authpieces[0];
    var ownerid = authpieces[1];

    if(!email || !ownerid){
      return res.redirect('/');
    }

    Invite.findOne({email: email, owner: ownerid}, function(err, inv) {
      if(err){
        return;
      }

      if(inv){

        var crypted_email = CryptoJS.AES.encrypt(inv.email, process.env.INVITE_SECRET).toString(CryptoJS.enc.Utf8);

        return res.view('creation', {auth: crypted_email});
      } else {
        return res.redirect('/');
      }
    });
    
  },

  create: function(req, res) {

    var auth = req.body.auth;

    if(!auth){
      return res.redirect('/');
    }

    var decrypted_email = CryptoJS.AES.decrypt(auth, process.env.INVITE_SECRET).toString(CryptoJS.enc.Utf8); 

    Invite.findOne({email: decrypted_email}, function(err, inv) {
      if(err){
        return;
      }

      if(inv){

        var u = req.body.username;
        var p = req.body.password;
        var s = req.body.secret;

        if(!u || !p || !s) {
          return res.redirect('/');
        }

        // hash pw
        bcrypt.hash(p, 2, function(err, hash) {

          // gen salt for identity (to reproduce hash later)
          bcrypt.genSalt(2, function(err, salt) {

            // encrypt for secretecy!
            var crypted_salt = require('crypto-js').AES.encrypt(salt, process.env.DARKROOM_SECRET).toString();

            // generate random identity
            var sodium = require('sodium');
            var ident1 = sodium.api.randombytes_uniform(1000000000).toString(32);
            var ident2 = sodium.api.randombytes_uniform(1000000000).toString(32);
            var ident3 = sodium.api.randombytes_uniform(1000000000).toString(32);
            var ident = ident1+ident2+ident3;

            User.create({name: u, password: hashedpw, secret: s, identity: ident, identity_salt: crypted_salt, dope: 1}, function(err, usr) {
              if(err) {
                return;
              }

              // usr wuz herre, no more inv
              inv.destroy();
              return res.redirect('/');
            });

          });
        });

      } else {
        return res.redirect('/');
      }
    });

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