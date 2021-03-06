/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)


  // fake - these would normally just be environment variables
  process.env.DARKROOM_SECRET="123456";
  process.env.IDENTITY_SECRET="7890123";
  process.env.INVITE_SECRET="098765432";

  // clear db/seed user if true
  if(false){
    Thought.destroy({}).exec(function(){});
    User.destroy({}).exec(function(){});

    var bcrypt = require('bcrypt');

    // generate password hash
    bcrypt.hash('whatapassword', 2, function(err, hash) {

      // bcrypt.genSalt(10, function(err, salt) {
      //     bcrypt.hash("", salt, function(err, hash) {
      //         // Store hash in your password DB. 
      //     });
      // });
      
      // store salt for identity usage!
      bcrypt.genSalt(2, function(err, salt) {

        // console.log(salt)
        
        // encrypt for secretecy!
        var crypted_salt = require('crypto-js').AES.encrypt(salt, process.env.DARKROOM_SECRET).toString();

        // generate random identity
        var sodium = require('sodium');
        var ident1 = sodium.api.randombytes_uniform(1000000000).toString(32);
        var ident2 = sodium.api.randombytes_uniform(1000000000).toString(32);
        var ident3 = sodium.api.randombytes_uniform(1000000000).toString(32);
        var ident = ident1+ident2+ident3;

        User.findOrCreate({name: 'fog', password: hash, identity_salt: crypted_salt, secret: 'voodoo', identity: ident, dope: 1}).exec(function(err, res){
          return;
        });
      });

    });

    bcrypt.hash('gogo', 2, function(err, hash) {

      // bcrypt.genSalt(10, function(err, salt) {
      //     bcrypt.hash("", salt, function(err, hash) {
      //         // Store hash in your password DB. 
      //     });
      // });
      
      // store salt for identity usage!
      bcrypt.genSalt(2, function(err, salt) {

        // console.log(salt)
        
        // encrypt for secretecy!
        var crypted_salt = require('crypto-js').AES.encrypt(salt, process.env.DARKROOM_SECRET).toString();

        // generate random identity
        var sodium = require('sodium');
        var ident1 = sodium.api.randombytes_uniform(1000000000).toString(32);
        var ident2 = sodium.api.randombytes_uniform(1000000000).toString(32);
        var ident3 = sodium.api.randombytes_uniform(1000000000).toString(32);
        var ident = ident1+ident2+ident3;

        User.findOrCreate({name: 'misterx', password: hash, identity_salt: crypted_salt, secret: 'zoo', identity: ident, dope: 1}).exec(function(err, res){
          return;
        });
      });

    });
  }
  

  cb();
};
