/**
 * ThoughtController
 *
 * @description :: Server-side logic for managing Thoughts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function(req, res) {

    Thought.find({}, function(err, tho) {
      if(err){
        return;
      }

      thoughts = [];

      for(var i=0; i<tho.length; i++){
        thoughts[i] = tho[i];

        // is it mine
        thoughts[i].mine = tho[i].identity === req.session.identity;
      }
      console.log(thoughts)
      return res.view('homepage', {thoughts: thoughts});
    });
  },

  create: function(req, res) {

    var bo = req.body.bo;
    var id = req.session.identity;
    var userid = req.session.userid;
    var bee = require('bcrypt');

    if(!id || !userid){
      // , {error: 'Missing Identity'}
      return res.clearCookie('authed').redirect('/login');
    }

    if(bo && bo.length > 0){

      User.findOne({id: userid}, function(err, use) {
        if(err){
          return;
        }

        // reencrypt user's secret to reveal user later for friendships
        var myst = require('crypto-js').AES.encrypt(use.secret, process.env.DARKROOM_SECRET).toString();

        Thought.create({body: bo, identity: id, mystery: myst, rating: 0}, function(err, tho) {
            if(err){
              return;
            }
        });  
      });
    }
    
    return res.redirect('/');
  },

  requests: function(req, res) {
    var userid = req.session.userid;

    console.log(userid)

    User.findOne({id: userid}, function(err, use) {
      if(err){
        return;
      }

      if(!use){
        // , {error: 'Missing Identity'}
        return res.clearCookie('authed').redirect('/login');
      }
    
      Request.find({$and: [{askee: use.id}, {asker: use.id} ]}).populate('thought').exec(function(err, reqqys)  {
        if(err){
          return;
        }

        they_requested = [];
        i_requested = [];

        for(var i=0; i<reqqys.length; i++){

          if(reqqys[i].asker == use.id){

            i_requested.push(reqqys[i].thought);
          } else if(reqqys[i].askee == use.id) {
            
            they_requested.push(reqqys[i]);
          }
        }

        res.view('requests', {to_me: they_requested, from_me: i_requested});
      });

    });
  },

  request: function(req, res) {
    Thought.findOne({id: req.body.id}, function(err, tho) {
      if(err){
        return;
      }

      User.findOne({id: req.session.userid}, function(err, use) {
        if(err){
          return;
        }

        if(!use){
          // , {error: 'Missing Identity'}
          return res.clearCookie('authed').redirect('/login');
        }
      
        var decrypto = require('crypto-js').AES.decrypt(tho.mystery, process.env.DARKROOM_SECRET).toString(); 

        User.findOne({secret: decrypto}, function(err, user) {
          if(err){
            return;
          }

          if(!user){
            // , {error: 'Missing Identity'}
            return res.clearCookie('authed').redirect('/login');
          }

          Request.create({asker: use.id, askee: user.id, thought: tho.id}, function(err, reqqy) {
            if(err){
              return res.send(400, "Boo Not Cool");
            } else {
              return res.send(200, "Cool");
            }
          });
        });

      });

    });
  },

  rating: function(req, res) {
    Thought.findOne({id: req.body.id}, function(err, tho) {
      if(err){
        return;
      }

      User.findOne({id: req.session.userid}, function(err, use) {
        if(err){
          return;
        }

        tho.rating += (val*use.dope);
        tho.save();

        return res.send(200, "Cool");

      });

    });
  },

  confirm: function(req, res) {
    // check secret... create harmony, destroy request
  }
};

