module.exports = function authcheck(req, res, next){
  var au = req.signedCookies.authed;
  if(au){
    var tokenlib = require('hash-auth-token')(process.env.DARKROOM_SECRET);
    var userObj = tokenlib.verify(au);
  }

  next();
}