module.exports = function authcheck(req, res, next){
  var au = req.signedCookies.authed;
  if(au){
    var tokenlib = require('hash-auth-token')(process.env.DARKROOM_SECRET);

    try{
      var userdata = tokenlib.verify(au);
    }
    catch(e){

      if(!userdata){
        return res.redirect('/login');
      }  
    }
    
  } else {
    return res.redirect('/login');
  }

  return next();
}