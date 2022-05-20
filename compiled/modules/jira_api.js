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
const node_fetch = require('node-fetch');
const mongo = require('./mongo');
const jira_client_1 = __importDefault(require("jira-client"));
const jiraClient = new jira_client_1.default({
    protocol: 'https',
    host: 'ott-support.atlassian.net',
    apiVersion: '3',
    username: 'helpdeskott.bot@gmail.com',
    password: ''
});
class JiraAPI {
    createIssue(type, issueInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = mongo.getConnection();
                const dbConfig = yield db.collection('bot_options').findOne({ _id: 'config' });
                const issueType = dbConfig.data.issue.type[type];
                const template = (yield db.collection('issues_templates').findOne({ _id: issueType })).data;
                template.fields.description.content[0].content.push({ text: issueInfo.problem, type: 'text' });
                template.fields.summary = `${issueInfo.userId}`;
                const res = yield jiraClient.addNewIssue(template);
                res.status = issueInfo.priority || '11';
                Object.assign(res, issueInfo);
                db.collection('issues').insertOne(res);
                console.log(`Created issue ${res.key}`);
                return res;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    getIssue(issueKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield jiraClient.getIssue(issueKey);
                return res;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    moveIssue(issueKey, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield jiraClient.transitionIssue(issueKey, { "transition": { "id": id } });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    assignIssue(issueKey, assigneName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield jiraClient.updateAssignee(issueKey, assigneName);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    updateIssue(issueId, issueUpdate, query) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = JiraAPI;
//# sourceMappingURL=jira_api.js.map