const router = require('express').Router();
const passport = require('passport');
// auth login

router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});
// local auth post method for login
router.post('/login', passport.authenticate('login'),
function(req,res){
    res.redirect('/');
}
);
//local auth get method for register
router.get('/register', function(req, res) {
    res.render('register', { });
});

//local auth post method for register
router.post('/register', passport.authenticate('register'),
function(req,res){
    res.redirect('/');
}
);

// auth loggout 
router.get('/logout', (req, res) => {
    //handle with passport
    req.logout();
    res.redirect('/');
});


// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/profile/');
});

module.exports = router;