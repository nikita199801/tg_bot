import { isNull, isUndefined } from "lodash";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import JiraAPI from "./modules/jira_api";
import mongo from "./modules/mongo"
var bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');

const express = require('express')
const app = express()
let redis = require('./modules/redis');
const LocalStrategy = require('./modules/local')
let RedisStore = require("connect-redis")(session)
const port = 3000


module.exports.startServer = async () => {

    passport.serializeUser(function (user: any, done) {
        done(null, user._id);
    });
    
    passport.deserializeUser(async function (user: any, done) {
        const db = mongo.getConnection();
        const retrivedUser = await db.collection('users').findOne({ _id: user });
        if (!isNull(retrivedUser) && !isUndefined(retrivedUser)) {
            const _user = user === retrivedUser._id ? retrivedUser : false;
            done(null, _user);
        }
    });
    
    app.set('view engine', 'ejs');

    var options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['htm', 'html'],
        index: false,
        maxAge: '1d',
        redirect: false,
        setHeaders: (req: any, res: any, next: Function) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            return next();
        }
    }

    app.use(express.static('views', options))
    app.use('/styles', express.static('./public/styles'))

    await mongo.connect();
    await redis.connect();
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(express.json())
    app.use(session({
        genid: () => uuidv4(),
        store: new RedisStore({ client: redis.getConnection(), prefix: 'session:' }),
        secret: 'kakoi to secret',
        name: 'uid',
        resave: true,
        expires: 86400,
        saveUninitialized: false,
        cookie: { secure: false }
    }))

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use('password', LocalStrategy)


    app.get('/bot/config', passport.authenticate('password', { session: false }), async (req: any, res: any) => {
        const db = mongo.getConnection();
        const result = await db.collection('bot_options').find({ _id: 'config' }).toArray();
        res.json(result[0].data)
    })

    app.get('/', async (req: any, res: any) => {
        res.render('index')
    })

    app.get('/register', async (req: any, res: any) => {
        res.render('register')
    })

    app.post('/register', async (req: any, res: any) => {
        const body = req.body;
        const jira_api = new JiraAPI(mongo.getConnection());
        const userInfo = await jira_api.getUserInfo(body.email);
        if (!userInfo) {
            res.redirect('/register');
            return;
        };
        Object.assign(body, userInfo)
        body.issuesOpen = 0;
        body._id = uuidv4(body.username)
        const db = mongo.getConnection();
        await db.collection('users').insertOne(body)
        res.redirect('/')
    })

    app.use('/issue', require('./routes/issues'));
    app.use('/auth', require('./routes/auth'));
    app.use('/admin', require('./routes/admin'));
    app.use('/profile', require('./routes/profile'));

    const server = app.listen(port, async () => {
        console.log(`App listening on port ${port}`)

    })

    process.on('SIGTERM', () => {
        console.info('SIGTERM signal received.');
        server.close(() => {
            console.log('Http server closed.');
            mongo.closeConnection().then(() => {
                console.info('Process stopped.')
                process.exit(0)
            })
        })
    })
}
