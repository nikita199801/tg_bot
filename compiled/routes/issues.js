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
const jira_api_1 = __importDefault(require("../modules/jira_api"));
const express = require('express');
const router = express.Router();
const redis = require('../modules/redis');
const api = new jira_api_1.default(mongo_1.default.getConnection());
const issueStrategy = require('../modules/strategy').create(mongo_1.default, redis, api);
router
    .post('/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield issueStrategy.createIssue(req.body.type, req.body);
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}))
    .post('/move', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield api.moveIssue(req.body.key, req.body.id);
        res.sendStatus(201);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}))
    .post('/close', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = { done: false };
        const { key, id, jiraId, chatId } = req.body;
        issueStrategy.updateIssueCounter(jiraId, 'decr');
        api.moveIssue(key, id);
        message.chat_id = parseInt(chatId, 10);
        message.done = true;
        message.id = key;
        issueStrategy.storeInMemory('message', message);
        yield issueStrategy.updateIssue(key, { status: id });
        res.sendStatus(201);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}))
    .post('/assign', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield api.assignIssue(req.body.key, req.body.name);
        res.sendStatus(201);
    }
    catch (error) {
        console.error(error);
    }
}))
    .get('/check', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issue = yield issueStrategy.fetchKeyFromStorage('message');
        if (!issue) {
            return res.json({});
        }
        res.json(issue);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
module.exports = router;
//# sourceMappingURL=issues.js.map