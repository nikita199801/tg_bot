import { isEmpty, isNull } from "lodash";
import { Db } from "mongodb";
import JiraAPI from "./jira_api";

type Order = "decr" | "incr";

class IssueAssignmentStrategy {
    mongo: Db;
    redis: any;
    jiraApi: JiraAPI;

    constructor(mongo: any, redis: any, jiraApi: any) {
        this.mongo = mongo.getConnection();
        this.redis = redis.getConnection();
        this.jiraApi = jiraApi
    }

    async findFreeUser(): Promise<string | null> {
        try {
            const user = await this.mongo.collection('users')
                .find({ active: true, issuesOpen: {$lt: 3 } })
                .sort({ active: -1, issuesOpen: 1 })
                .limit(1)
                .project({accountId: 1, _id: 0})
                .toArray();

            if (isEmpty(user)) {
                return null;
            }
            return user[0].accountId;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async updateIssueCounter(jiraId: string, ascendDirection: Order): Promise<void> {
        try {
            const values = {
                incr: 1,
                decr: -1
            }
            await this.mongo.collection('users').findOneAndUpdate({ accountId: jiraId }, { $inc: { issuesOpen: values[ascendDirection] } });
        } catch (error) {
            console.error(error)
        }
    }

    async storeInMemory(key: string, value: any) {
        try {
            const issue = JSON.stringify(value)
            this.redis.rpush(key, issue);
        } catch (error) {
            console.error(error);
        }
    }

    async saveStatistics(value: any) {
        try {
            Object.assign(value, { created_at: Date.now() });
            await this.mongo.collection('stats').insertOne(value);
        } catch (error) {
            console.error(error);
        }
    }
    
    async checkQueue() {
        try {
            const key = "issues"
            const res = await this.fetchKeyFromStorage(key);
            
            if (res) {
                const user = await this.findFreeUser();
                if (isNull(user)) {
                    await this.redis.lpush(key, res);
                    return
                }
                console.info('Got issue stored in queue');
                const issue = JSON.parse(res);
                await this.jiraApi.assignIssue(issue.id, user);
                await this.updateIssueCounter(user, 'incr');
                Object.assign(issue, { assignee: user });
                this.mongo.collection('issues').insertOne(issue);
                this.redis.lpush('message', res);
            }
        } catch (error) {
            console.error(error)
        }
    }

    async fetchKeyFromStorage(key: string) {
        try {
            const res = await this.redis.lpop(key);
            if (res) {
                return res;
            }
            return null
        } catch (error) {
            console.error(error);
        }
    }

    async updateIssue(id: string, query: any) {
        try {
            await this.mongo.collection('issues').updateOne({ id }, { $set: query });
            return true
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async createIssue(issueType: string, issueInfoFromBot: any) {   
        try {
            const issue = await this.jiraApi.createIssue(issueType, issueInfoFromBot);
            if (isEmpty(issue) || issue.error) {
                return { error: 'Issue creation failed' };
            }
            const user = await this.findFreeUser();
            issue.status = issueInfoFromBot.status || '11';
            Object.assign(issue, issueInfoFromBot)
            if (isNull(user)) {
                this.storeInMemory("issues", issue);
                return { message: 'in queue' };
            }
    
            await this.jiraApi.assignIssue(issue.id, user);
            await this.updateIssueCounter(user, 'incr');
            Object.assign(issue, {assignee: user});
            console.log(`Created issue ${issue.key}`)
            this.mongo.collection('issues').insertOne(issue);
            return issue
            
        } catch (error) {
            console.error(error);
            return { error: 'Issue creation failed' };
        }
    }
}

module.exports.create = (mongo: any, redis: any, jiraApi: any) => {
    const strategy = new IssueAssignmentStrategy(mongo, redis, jiraApi);
    setInterval(() => strategy.checkQueue(), 5000);
    return strategy;
};
