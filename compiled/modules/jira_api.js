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
const jira_client_1 = __importDefault(require("jira-client"));
const lodash_1 = require("lodash");
const jiraClient = new jira_client_1.default({
    protocol: 'https',
    host: 'ott-support.atlassian.net',
    apiVersion: '3',
    username: 'helpdeskott.bot@gmail.com',
    password: '0gmrB2btNz6wE7YqVpwfE127'
});
class JiraAPI {
    constructor(mongoConnection) {
        this.mongo = mongoConnection;
    }
    createIssue(type, issueInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dbConfig = (yield this.mongo.collection('bot_options').findOne({ _id: 'config' })).data;
                const issueType = dbConfig.issue.type[type];
                const template = (yield this.mongo.collection('issues_templates').findOne({ _id: issueType })).data;
                if ((0, lodash_1.isEmpty)(template)) {
                    return null;
                }
                ;
                template.fields.description.content[0].content.push({ text: issueInfo.problem, type: 'text' });
                template.fields.summary = `${issueInfo.chat_id}-${issueInfo.user_id}-${issueInfo.timestamp}`;
                template.fields.customfield_10036 = (0, lodash_1.toString)(issueInfo.user_id);
                template.fields.customfield_10035 = `https://t.me/${issueInfo.user_name}`;
                const res = yield jiraClient.addNewIssue(template);
                Object.assign(res, {
                    chatLink: `https://t.me/${issueInfo.user_name}`,
                    user_id: (0, lodash_1.toString)(issueInfo.user_id)
                });
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
    assignIssue(issueKey, assigneeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield jiraClient.updateAssigneeWithId(issueKey, assigneeId);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    getUsersIssues(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield jiraClient.searchJira(`assignee="${id}" AND resolution is empty`);
                return res.issues;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    getUserInfo(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const options = {
                    username: '',
                    query: userEmail,
                    maxResults: 1
                };
                const res = yield jiraClient.searchUsers(options);
                if ((0, lodash_1.isEmpty)(res) && (0, lodash_1.isNull)(res)) {
                    return null;
                }
                return res[0];
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
}
exports.default = JiraAPI;
//# sourceMappingURL=jira_api.js.map