const LocalStrategy = require('passport-local');
const mongo = require('./mongo');
module.exports = new LocalStrategy(
    async function (username: string, password: string, done: Function) {
        const db =  mongo.getConnection()
        const user = await db.collection('users').findOne({ username: username, password })
        if (!user) { return done(null, false); }
        return done(null, user, { scope: 'all' });
    }
)