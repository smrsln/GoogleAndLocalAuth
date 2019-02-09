const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const app = express();
const localpassSetup = require('./config/pass-local-setup');
//const passportSetup = require('./config/passport-setup');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');
const neo4j = require('neo4j-driver').v1;
port = 3000;
//setup view engine
app.set('view engine','ejs');

app.use(cookieSession({
    maxAge:24*60*1000,
    keys:[keys.session.cookieKey]
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

//setup routes
app.use('/auth',authRoutes);
app.use('/profile',profileRoutes);

//create home route
app.get('/',(req,res) => {
    res.render('home', { user: req.user });
});

app.listen(port, () => {
    console.log('app now listening for requests on port ' + port);
});