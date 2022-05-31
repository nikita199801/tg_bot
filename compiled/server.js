"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const passport_1 = __importDefault(require("passport"));
const uuid_1 = require("uuid");
const jira_api_1 = __importDefault(require("./modules/jira_api"));
const mongo_1 = __importDefault(require("./modules/mongo"));
var bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const express = require('express');
const app = express();
let redis = require('./modules/redis');
const LocalStrategy = require('./modules/local');
let RedisStore = require("connect-redis")(session);
const port = 3000;
module.exports.startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.serializeUser(function (user, done) {
        done(null, user._id);
    });
    passport_1.default.deserializeUser(function (user, done) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = mongo_1.default.getConnection();
            const retrivedUser = yield db.collection('users').findOne({ _id: user });
            if (!(0, lodash_1.isNull)(retrivedUser) && !(0, lodash_1.isUndefined)(retrivedUser)) {
                const _user = user === retrivedUser._id ? retrivedUser : false;
                done(null, _user);
            }
        });
    });
    app.set('view engine', 'ejs');
    var options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['htm', 'html'],
        index: false,
        maxAge: '1d',
        redirect: false,
        setHeaders: (req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            return next();
        }
    };
    app.use(express.static('views', options));
    app.use('/styles', express.static('./public/styles'));
    yield mongo_1.default.connect();
    yield redis.connect();
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(session({
        genid: () => (0, uuid_1.v4)(),
        store: new RedisStore({ client: redis.getConnection(), prefix: 'session:' }),
        secret: 'kakoi to secret',
        name: 'uid',
        resave: true,
        expires: 86400,
        saveUninitialized: false,
        cookie: { secure: false }
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use('password', LocalStrategy);
    app.get('/bot/config', passport_1.default.authenticate('password', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const db = mongo_1.default.getConnection();
        const result = yield db.collection('bot_options').find({ _id: 'config' }).toArray();
        res.json(result[0].data);
    }));
    app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.render('index');
    }));
    app.get('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.render('register');
    }));
    app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const body = req.body;
        const jira_api = new jira_api_1.default(mongo_1.default.getConnection());
        const userInfo = yield jira_api.getUserInfo(body.email);
        if (!userInfo) {
            res.redirect('/register');
            return;
        }
        ;
        Object.assign(body, userInfo);
        body.issuesOpen = 0;
        body._id = (0, uuid_1.v4)(body.username);
        const db = mongo_1.default.getConnection();
        yield db.collection('users').insertOne(body);
        res.redirect('/');
    }));
    app.use('/issue', require('./routes/issues'));
    app.use('/auth', require('./routes/auth'));
    app.use('/admin', require('./routes/admin'));
    app.use('/profile', require('./routes/profile'));
    const server = app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`App listening on port ${port}`);
    }));
    process.on('SIGTERM', () => {
        console.info('SIGTERM signal received.');
        server.close(() => {
            console.log('Http server closed.');
            mongo_1.default.closeConnection().then(() => {
                console.info('Process stopped.');
                process.exit(0);
            });
        });
    });
});
//# sourceMappingURL=server.js.map