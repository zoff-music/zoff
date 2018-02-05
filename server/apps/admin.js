var express = require('express');
var app = express();

const path = require('path');
const publicPath = path.join(__dirname + "", '../public');
var exphbs = require('express-handlebars');
var hbs = exphbs.create({
   defaultLayout: publicPath + '/layouts/admin/main',
   layoutsDir: publicPath + '/layouts',
   partialsDir: publicPath + '/partials'
});

var passport = require('passport');
var mpromise = require('mpromise');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var mongo_db_cred = require(pathThumbnails + '/config/mongo_config.js');
var mongojs = require('mongojs');
var db = mongojs(mongo_db_cred.config);
var token_db = mongojs("tokens");
var bodyParser = require('body-parser');
var Cookies = require('cookies');
var session = require('express-session');
var api = require(pathThumbnails + '/routing/admin/api.js');

var User = require(pathThumbnails + '/models/user.js');
var url = 'mongodb://' + mongo_db_cred.host + '/' + mongo_db_cred.user;
mongoose.connect(url);


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.enable('view cache');
app.set('views', publicPath);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: mongo_db_cred.secret,
  resave: true,
  saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//app.use('/assets', express.static(publicPath + '/assets'));

passport.serializeUser(function(user, done) {
   done(null, user.id);
});



// used to deserialize the user
passport.deserializeUser(function(id, done) {
   User.findById(id, function(err, user) {
      done(err, user);
   });
});

passport.use('local-signup', new LocalStrategy({
   // by default, local strategy uses username and password, we will override with username
   usernameField : 'username',
   passwordField : 'password',
   passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, username, password, done) {
   // asynchronous
   // User.findOne wont fire unless data is sent back
   process.nextTick(function() {

      // find a user whose username is the same as the forms username
      // we are checking to see if the user trying to login already exists
      var token = req.param("token");
      token_db.collection("tokens").find({token: token}, function(err, docs){
         if(docs.length == 1){
            token_db.collection("tokens").remove({token: token}, function(err, docs){
               User.findOne({ 'username' :  username }, function(err, user) {
                  // if there are any errors, return the error
                  if (err)
                  return done(err);

                  // check to see if theres already a user with that username
                  if (user) {
                     return done(null, false);
                  } else {

                     // if there is no user with that username
                     // create the user
                     var newUser            = new User();

                     // set the user's local credentials
                     newUser.username    = username;
                     newUser.password = newUser.generateHash(password);

                     // save the user
                     newUser.save(function(err) {
                        if (err)
                        throw err;
                        return done(null, newUser);
                     });
                  }

               });
            });
         } else {
            return done(null, false);
         }
      });
   });

}));

passport.use('local-login', new LocalStrategy({
   // by default, local strategy uses username and password, we will override with email
   usernameField : 'username',
   passwordField : 'password',
   passReqToCallback : true // allows us to pass back the entire request to the callback
},    function(req, username, password, done) { // callback with email and password from our form

   // find a user whose email is the same as the forms email
   // we are checking to see if the user trying to login already exists
   User.findOne({ 'username' :  username }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err)
      return done(err);

      // if no user is found, return the message
      if (!user)
      return done(null, false); // req.flash is the way to set flashdata using connect-flash

      // if the user is found but the password is wrong
      if (!user.validPassword(password))
      return done(null, false); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user

      return done(null, user);
   });

}));

app.post('/signup', passport.authenticate('local-signup', {
   successRedirect : '/', // redirect to the secure profile section
   failureRedirect : '/signup', // redirect back to the signup page if there is an error
   failureFlash : true // allow flash messages
}));

app.post('/login', passport.authenticate('local-login', {
   successRedirect : '/', // redirect to the secure profile section
   failureRedirect : '/login', // redirect back to the signup page if there is an error
   failureFlash : true // allow flash messages
}));

app.use('/login', isLoggedInTryingToLogIn, function(req, res) {
   var data = {
      where_get: "not_authenticated"
   };

   res.render('layouts/admin/not_authenticated', data);
});

app.use('/signup', isLoggedInTryingToLogIn, function(req, res) {
   var data = {
      where_get: "not_authenticated"
   };

   res.render('layouts/admin/not_authenticated', data);
});

app.use('/', api);

app.use('/logout', function(req, res) {
   req.logout();
   res.redirect('/login');
});

app.use('/assets', express.static(publicPath + '/assets'));

app.use('/', isLoggedIn, function(req, res) {
   var data = {
      where_get: "authenticated",
      year: new Date().getYear()+1900,
   };

   res.render('layouts/admin/authenticated', data);
});

function makeid()
{
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

   for( var i=0; i < 20; i++ )
   text += possible.charAt(Math.floor(Math.random() * possible.length));

   return text;
}

function isLoggedInTryingToLogIn(req, res, next){
   if(!req.isAuthenticated()){
      return next();
   }
   res.redirect("/");
}

function isLoggedIn(req, res, next) {
   if (req.isAuthenticated())
   return next();
   res.redirect('/login');
}

//app.listen(default_port);

module.exports = app;
