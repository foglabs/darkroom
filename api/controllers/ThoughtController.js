/**
 * ThoughtController
 *
 * @description :: Server-side logic for managing Thoughts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function(req, res) {

    if(!req.session.userid){
      return res.redirect('/login');
    }

    // get all my friendships
    Harmony.find({owner: req.session.userid }).populate('friend').exec(function(err, harmonies) {
      if(err){
        return;
      }

      // all identities
      var friend_identities = [];
      for(var i=0; i<harmonies.length; i++){
        friend_identities.push(harmonies[i].friend_identity);
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
          var is_friend = friend_identities.indexOf(tho[i].identity);

          // console.log(is_friend)

          if(is_friend>-1){
            
            harmonies[is_friend].friend.identity = null;
            thoughts[i].friend = harmonies[is_friend].friend;
          } else {
            thoughts[i].friend = null;
          }
          
          thoughts[i].datestring = tho[i].createdAt.getUTCFullYear() + '-' + tho[i].createdAt.getUTCMonth() + '-' + tho[i].createdAt.getUTCDay();

          // console.log(thoughts[i])
        }


        // console.log(thoughts)
        return res.view('homepage', {thoughts: thoughts});
      });
    });

  },

  say: function(req, res) {

    var bo = req.body.bo;
    var id = req.session.identity;
    var userid = req.session.userid;
    var bee = require('bcrypt');

    // console.log(req.session.identity)
    // console.log(req.session.userid)

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

            sails.sockets.broadcast("newposts", "a_new_post", tho.id);
        });
      });
    }
    
    return res.redirect('/');
  },

///////// show dat client some shit

  get_new_posts: function(req, res) {
    if (!req.isSocket) {return res.badRequest();}
    
    sails.sockets.join(req.socket, "newposts");
    // sails.sockets.broadcast("newposts", "a_new_post", data);
    return;
  },

  get_post_details: function(req, res) {
    
    var postid = req.body.postid;
    var userid = req.session.userid;
    // var userid = req.body.userid;

    Harmony.find({owner: userid }).populate('friend').exec(function(err, harmonies) {
      if(err){
        return;
      }

      User.findOne({id: userid}, function(err, use) {
        if(err){
          return;
        }

        Thought.findOne({id: postid}, function(err, tho) {
          if(err){
            return;
          }

          var friend_identities = [];
          for(var i=0; i<harmonies.length; i++){
            friend_identities.push(harmonies[i].friend_identity);
          }

          var newthought = tho;

          // is it mine
          newthought.mine = tho.identity === req.session.identity;
          var is_friend = friend_identities.indexOf(tho.identity);

          if(is_friend>-1){
            
            harmonies[is_friend].friend.identity = null;
            newthought.friend = harmonies[is_friend].friend;
          } else {
            newthought.friend = null;
          }

          newthought.datestring = tho.createdAt.getUTCFullYear() + '-' + tho.createdAt.getUTCMonth() + '-' + tho.createdAt.getUTCDay();
          
          return res.send(200, newthought);
        });

      });
    });

  },


  requests: function(req, res) {
    var userid = req.session.userid;

    // console.log(userid)

    User.findOne({id: userid}, function(err, use) {
      if(err){
        return;
      }

      if(!use){
        // , {error: 'Missing Identity'}
        return res.clearCookie('authed').redirect('/login');
      }
    
      // console.log(use)
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

      var new_friend = reqqy.asker;
      
      // reproduce new friend's identity
      var hashme = new_friend.identity + ':' + process.env.IDENTITY_SECRET;
      var CryptoJS = require('crypto-js');
      var decrypted_salt = CryptoJS.AES.decrypt(new_friend.identity_salt, process.env.DARKROOM_SECRET).toString(CryptoJS.enc.Utf8);   

      require('bcrypt').hash(hashme, decrypted_salt, function(err, identhash) {
        
        // recreate my hot hash
        var new_friend_identity = identhash;

        Harmony.create([{owner: reqqy.asker.id, friend: req.session.userid, friend_identity: req.session.identity }, {owner: req.session.userid, friend: reqqy.asker.id, friend_identity: new_friend_identity}]).exec(function(err, harms) {
          if(err){
            return;
          }

          Request.destroy({$or: [{askee: req.session.userid, asker: reqqy.asker.id}, {askee: reqqy.asker.id, asker: req.session.userid} ]}).populate('asker').populate('askee').populate('thought').exec(function(err, reqdestroy) {
            console.log('destroyed!')
            res.redirect('/');
          });

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

        // console.log(decrypto)
        User.findOne({secret: decrypto}, function(err, friend) {
          if(err){
            return;
          }

          if(!friend){
            // , {error: 'Missing Identity'}
            return res.clearCookie('authed').redirect('/login');
          }

          Request.count({owner: req.session.userid, thought: tho.id}, function(err, reqcount) {
            if(err){
              return;
            }
            if(reqcount==0){

              Harmony.count({owner: req.session.userid, friend: friend.id}, function(err, harmcount) {
                if(harmcount==0){

                  // only if not already my friend
                  Request.create({asker: use.id, askee: friend.id, thought: tho.id}, function(err, reqqy) {
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
            } else {
              return res.send(200, "Already Requested!");
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

      // console.log(req.session.userid)
      User.findOne({id: req.session.userid}, function(err, use) {
        if(err){
          return;
        }

        // console.log(req.body)

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
  },

////// invites!

  invites: function(req, res) {
    Invite.find({owner: req.session.userid}, function(err, inv) {
      if(err){
        return;
      }

      return res.view('invites', {invites: inv});
    });
  },


  noinvite: function(req, res) {
    Invite.destroy({id: req.body.inv_id}, function(err, inv) {
      if(err){
        return;
      }

      return res.send(200, 'Yay');
    });
  },

  send_invite: function(req, res) {
    var CryptoJS = require('crypto-js');
    var email = req.body.email;

    if(!email){
      return res.redirect('/');
    }

    Invite.create({owner: req.session.userid, email: email}, function(err, inv) {
      if(err){
        return;
      }

      var tocrypt = inv.email+":"+req.session.userid;
      var encrypted = CryptoJS.AES.encrypt(tocrypt, process.env.INVITE_SECRET).toString();
      var authcode = CryptoJS.enc.Base64.parse(encrypted).toString(CryptoJS.enc.Hex);

      // // send da email maybe
      // sails.hooks.email.send('/invite_email', {auth: authcode}, {to: email, from: "DARK ROOM", subject: "Come Inside"}, function(no, yes) {

      //   console.log("No is "+no)
      //   console.log("Yes is "+yes)
      // });

      console.log('http://localhost:1337/invited?auth='+authcode)

      return res.redirect('/invites');
    });
  }

};

