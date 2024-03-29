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
const mongo_1 = __importDefault(require("../modules/mongo"));
const router = require('express').Router();
router
    .get('/dashboard/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.isAuthenticated()) {
            const db = mongo_1.default.getConnection();
            const user = yield db.collection('users').findOne({ _id: req.params.id });
            if (!user) {
                res.redirect('/');
                return;
            }
            const issues = yield db.collection('issues').find({ assignee: user.accountId, status: { $in: ['11', '21'] } }).sort({ id: -1 }).limit(10).toArray();
            const closedIssues = yield db.collection('issues').find({ assignee: user.accountId, status: '31' }).sort({ id: -1 }).limit(10).toArray();
            issues.forEach(e => e.self = `https://ott-support.atlassian.net/browse/${e.key}`);
            res.render('profile', { user: Object.assign({}, user), issues, closedIssues });
        }
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}))
    .get('/dashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.isAuthenticated()) {
            res.redirect(`http://localhost:3000/profile/dashboard/${req.session.passport.user}`);
        }
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
module.exports = router;
//# sourceMappingURL=profile.js.map