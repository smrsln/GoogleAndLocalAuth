const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(keys.connection.address, neo4j.auth.basic(keys.connection.username, keys.connection.password));
var session = driver.session();

passport.serializeUser((user, done) => {
    done(null, user.googleId);
});

passport.deserializeUser((id, done) => {
    session
        .run('MATCH (user:Users{id : {id}}) RETURN user.name AS name, user.photo AS photo, user.id AS id', { id: id })
        .then(function (user) {
            user.records.forEach(function (record) {
                var name = record.get('name');
                var photo = record.get('photo');
                var id = record.get('id');
                user = {
                    name: name,
                    photo: photo,
                    id: id
                };
                done(null, user);
            });
            session.close();
        })
        .catch(function (error) {
            console.log(error)
        });
});

passport.use(
    new GoogleStrategy({
        //options for the strategy
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accesToken, refreshToken, profile, done) => {
        //passport callback function
        console.log('passport callback function fired')

        session
            .run('MERGE (search:Users{id : {gIdParam}, name: {gUserName}, photo: {gThumbnail}}) RETURN search.name AS name, search.photo AS photo, search.id AS id', {
                gIdParam: profile.id,
                gUserName: profile.displayName,
                gThumbnail: profile._json.image.url
            })
            .subscribe({
                onNext: function (record) {
                    var name = record.get('name');
                    var photo = record.get('photo');
                    var id = record.get('id');
                    user = {
                        name: name,
                        photo: photo,
                        id: id
                    };
                    done(null, user);
                },
                onCompleted: function () {
                    session.close();
                },
                onError: function (error) {
                    console.log(error);
                    done(null, false);
                    driver.close();
                }
            })
    })
);