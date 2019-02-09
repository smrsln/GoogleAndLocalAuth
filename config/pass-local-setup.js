const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const keys = require('./keys');
const neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(keys.connection.address, neo4j.auth.basic(keys.connection.username, keys.connection.password));
var session = driver.session();


passport.serializeUser((user, done) => {
    console.log(user.id + ' serialize çalıştı');
    done(null, user.id);
})
passport.deserializeUser((id, done) => {
    console.log(id + ' deserialize id si');
    session
        .run('MATCH (user:Users{id : {id}}) RETURN user.id AS id, user.userName AS username', { id: id })
        .then(function (user) {
            user.records.forEach(function (record) {
                var id = record.get('id');
                var username = record.get('username');
                console.log('deserialize çalıştı ' + record.get('id'));
                user = {
                    id: id,
                    username: username
                };
                console.log(user);
                done(null, user);
            });
            session.close();
        })
        .catch(function (error) {
            console.log(error)
            driver.close();
        });
});

passport.use('register', new LocalStrategy(
    function (username, password, done) {
        user = {
            username: username,
            password: password
        };
        console.log('register başlangıcı' + user.username);
        var readTxResultPromise = session.readTransaction(function (transaction) {
            var result = transaction.run("CREATE (register:Users{userName: {username}, password: {password}, id:randomUUID()}) RETURN register.userName AS username, register.password AS password, register.id AS id", {
                username: user.username,
                password: user.password
            });
            return result;
        });
        readTxResultPromise.then(function (result) {
            session.close();
            result.records.forEach(function (record) {
                var username = record.get('username');
                var password = record.get('password');
                var id = record.get('id');
                user = {
                    username: username,
                    password: password,
                    id: id
                };
                console.log('Kayıt Başarılı ! ' + user.username + ' ' + user.password + ' ' + user.id);
                done(null, user);

            });

        }).catch(function (error) {
            console.log(error);
        });


    }
));

passport.use('login', new LocalStrategy(
    function (username, password, done) {
        user = {
            username: username,
            password: password
        };
        console.log(user.username);
        var readTxResultPromise = session.readTransaction(function (transaction) {
            var result = transaction.run("MATCH (login:Users{userName: {username}, password: {password}}) RETURN login.userName AS username, login.password AS password, login.id AS id", {
                username: user.username,
                password: user.password
            });
            return result;
        });
        readTxResultPromise.then(function (result) {
            session.close();
            result.records.forEach(function (record) {
                if (user.username == record.get('username') && user.password == record.get('password')) {
                    console.log('done çalıştı serialize a gitti');
                    var username = record.get('username');
                    var password = record.get('password');
                    var id = record.get('id');
                    user = {
                        username: username,
                        password: password,
                        id: id
                    };
                    done(null, user);
                }
            });

        }).catch(function (error) {
            console.log(error);
        });
    }
));