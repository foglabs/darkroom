/**
 * ThoughtController
 *
 * @description :: Server-side logic for managing Thoughts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function(req, res) {

    Harmony.find({owner: req.session.userid }).populate('friend').exec(function(err, harmonies) {
      if(err){
        return;
      }

      thought_identities = [];
      for(var i=0; i<harmonies.length; i++){
        thought_identities.push(harmonies[i].friend_identity);
      }


      Thought.find({}, function(err, tho) {
        if(err){
          return;
        }

        thoughts = [];

        for(var i=0; i<tho.length; i++){
          thoughts[i] = tho[i];

          // is it mine
          thoughts[i].mine = tho[i].identity === req.session.identity;

          var is_friend = thought_identities.indexOf(tho[i].identity);

          console.log(harmonies)

          if(is_friend>-1){
            thoughts[i].friend = harmonies[is_friend].friend;
          } else {
            thoughts[i].friend = null;
          }
        }



        // console.log(thoughts)
        return res.view('homepage', {thoughts: thoughts});
      });
    });

  },

  create: function(req, res) {

    var bo = req.body.bo;
    var id = req.session.identity;
    var userid = req.session.userid;
    var bee = require('bcrypt');

    console.log(req.session.identity)
    console.log(req.session.userid)

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
    
      console.log(use)
      Request.find({$or: [{askee: use.id}, {asker: use.id} ]}).populate('asker').populate('askee').populate('thought').exec(function(err, reqqys)  {
        if(err){
          return;
        }

        they_requested = [];
        i_requested = [];

        for(var i=0; i<reqqys.length; i++){

          if(reqqys[i].asker.id == use.id){

            i_requested.push(reqqys[i].thought);
          } else if(reqqys[i].askee.id == use.id) {
            
            they_requested.push(reqqys[i]);
          }
        }

        res.view('requests', {to_me: they_requested, from_me: i_requested});
      });

    });
  },

  accept: function(req, res) {
    Request.findOne({id: req.body.id}).populate('asker').populate('askee').populate('thought').exec(function(err, reqqy) {

      if(err){
        return;
      }

      console.log(reqqy)

      Harmony.create([{owner: reqqy.asker.id, friend: req.session.userid, friend_identity: req.session.identity}, {owner: req.session.userid, friend: reqqy.asker.id, friend_identity: reqqy.thought.identity}]).exec(function(err, harms) {
        if(err){
          return;
        }

        console.log(harms)

        Request.destroy({$or: [{askee: req.session.userid, asker: reqqy.asker.id}, {askee: reqqy.asker.id, asker: req.session.userid} ]}).populate('asker').populate('askee').populate('thought').exec(function(err, reqdestroy) {
          console.log('destroyed!')
          res.redirect('/');
        });

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
      
        var CryptoJS = require('crypto-js');
        var decrypto = CryptoJS.AES.decrypt(tho.mystery, process.env.DARKROOM_SECRET).toString(CryptoJS.enc.Utf8); 

        console.log(decrypto)
        User.findOne({secret: decrypto}, function(err, user) {
          if(err){
            return;
          }

          if(!user){
            // , {error: 'Missing Identity'}
            return res.clearCookie('authed').redirect('/login');
          }


          Harmony.count({owner: req.session.userid, friend: friend.id}, function(err, count) {
            if(count==0){

              Request.create({asker: use.id, askee: friend.id, thought: tho.id}, function(err, reqqy) {
                console.log(reqqy)
                if(err){
                  return res.send(400, "Boo Not Cool");
                } else {
                  return res.send(200, "Cool");
                }
              });

            } else {
              return res.send(200, "Already Friends!");
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

        console.log(req.body)

        tho.rating += (parseInt(req.body.val)*use.dope);
        tho.save();

        return res.send(200, "Cool");

      });

    });
  },

  harmonies: function(req, res) {
    Harmony.find({owner: req.session.userid}).populate('friend').populate('owner').exec(function(err, harms) {
      if(err){
        return;
      }

      return res.view('harmonies', {harmonies: harms});
    });
    // check secret... create harmony, destroy request
  }
};

