import mongo from "../modules/mongo"; 
const LocalStrategy = require('passport-local');
module.exports = new LocalStrategy(
    async function (username: string, password: string, done: Function) {
        try {
            const db =  mongo.getConnection()
            const user = await db.collection('users').findOne({ username: username, password })
            if (!user) { return done(null, false); }
            return done(null, user, { scope: 'all' });
        } catch (error) {
            console.error(error);
            return done(null, false);
        }
    }
)