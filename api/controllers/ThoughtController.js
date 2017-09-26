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
      console.log(tho)
      return res.view('homepage', {thoughts: tho});
    });
  },

  create: function(req, res) {

    var bo = req.body.bo;
    var id = req.session.identity;
    var bee = require('bcrypt');

    if(!id){
      // , {error: 'Missing Identity'}
      return res.clearCookie('authed').redirect('/login');
    }

    console.log(id)
    console.log(bo)

    if(bo && bo.length > 0 && id){

      Thought.create({body: bo, identity: id}, function(err, tho) {
          if(err){
            return;
          }

          console.log(tho);
      });  
    }
    
    return res.redirect('/');
  },
};

