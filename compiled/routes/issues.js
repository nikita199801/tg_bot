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
const api = new jira_api_1.default(mongo.getConnection());
router
    .post('/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield api.createIssue(req.body.type, req.body);
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
}));
module.exports = router;
//# sourceMappingURL=issues.js.map