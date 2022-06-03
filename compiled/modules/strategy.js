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
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class IssueAssignmentStrategy {
    constructor(mongo, redis, jiraApi) {
        this.mongo = mongo.getConnection();
        this.redis = redis.getConnection();
        this.jiraApi = jiraApi;
    }
    findFreeUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.mongo.collection('users')
                    .find({ active: true, issuesOpen: { $lt: 3 } })
                    .sort({ active: -1, issuesOpen: 1 })
                    .limit(1)
                    .project({ accountId: 1, _id: 0 })
                    .toArray();
                if ((0, lodash_1.isEmpty)(user)) {
                    return null;
                }
                return user[0].accountId;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    updateIssueCounter(jiraId, ascendDirection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const values = {
                    incr: 1,
                    decr: -1
                };
                yield this.mongo.collection('users').findOneAndUpdate({ accountId: jiraId }, { $inc: { issuesOpen: values[ascendDirection] } });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    storeInMemory(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const issue = JSON.stringify(value);
                this.redis.rpush(key, issue);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    saveStatistics(value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                Object.assign(value, { created_at: Date.now() });
                yield this.mongo.collection('stats').insertOne(value);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    checkQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const key = "issues";
                const res = yield this.fetchKeyFromStorage(key);
                if (res) {
                    const user = yield this.findFreeUser();
                    if ((0, lodash_1.isNull)(user)) {
                        yield this.redis.lpush(key, res);
                        return;
                    }
                    console.info('Got issue stored in queue');
                    const issue = JSON.parse(res);
                    yield this.jiraApi.assignIssue(issue.id, user);
                    yield this.updateIssueCounter(user, 'incr');
                    Object.assign(issue, { assignee: user });
                    this.mongo.collection('issues').insertOne(issue);
                    this.redis.lpush('message', res);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    fetchKeyFromStorage(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.redis.lpop(key);
                if (res) {
                    return res;
                }
                return null;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    updateIssue(id, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.mongo.collection('issues').updateOne({ id }, { $set: query });
                return true;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    createIssue(issueType, issueInfoFromBot) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const issue = yield this.jiraApi.createIssue(issueType, issueInfoFromBot);
                if ((0, lodash_1.isEmpty)(issue) || issue.error) {
                    return { error: 'Issue creation failed' };
                }
                const user = yield this.findFreeUser();
                issue.status = issueInfoFromBot.status || '11';
                Object.assign(issue, issueInfoFromBot);
                if ((0, lodash_1.isNull)(user)) {
                    this.storeInMemory("issues", issue);
                    return { message: 'in queue' };
                }
                yield this.jiraApi.assignIssue(issue.id, user);
                yield this.updateIssueCounter(user, 'incr');
                Object.assign(issue, { assignee: user });
                console.log(`Created issue ${issue.key}`);
                this.mongo.collection('issues').insertOne(issue);
                return issue;
            }
            catch (error) {
                console.error(error);
                return { error: 'Issue creation failed' };
            }
        });
    }
}
module.exports.create = (mongo, redis, jiraApi) => {
    const strategy = new IssueAssignmentStrategy(mongo, redis, jiraApi);
    setInterval(() => strategy.checkQueue(), 5000);
    return strategy;
};
//# sourceMappingURL=strategy.js.map