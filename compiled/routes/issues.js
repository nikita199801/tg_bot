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
const express = require('express');
const router = express.Router();
const mongo = require('../modules/mongo');
const jira_api_1 = __importDefault(require("../modules/jira_api"));
const redis = require('../modules/redis');
const api = new jira_api_1.default(mongo.getConnection());
const issueStrategy = require('../modules/strategy').create(mongo, redis, api);
router
    .post('/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield issueStrategy.createIssue(req.body.type, req.body);
    res.json(result);
}))
    .post('/move', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield api.moveIssue(req.body.key, req.body.id);
    res.send(200, 'OK');
}))
    .post('/assign', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield api.assignIssue(req.body.key, req.body.name);
    res.send(200, 'OK');
}))
    .get('/user/get/issues', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield api.getUsersIssues('6286b551ca7d7f0069029bc6');
    res.send(200, 'OK');
}))
    .get('/user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield api.getUserInfo('helpdeskott.bot@gmail.com');
    if (!userInfo) {
        return null;
    }
    res.send(200, 'OK');
}))
    .get('/check', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const issue = yield issueStrategy.fetchKeyFromStorage('message');
    if (!issue) {
        return res.json({});
    }
    res.json(issue);
}));
module.exports = router;
//# sourceMappingURL=issues.js.map