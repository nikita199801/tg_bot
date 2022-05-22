const node_fetch = require('node-fetch')

import JiraApi from 'jira-client';
import { isEmpty } from 'lodash';
import { Db } from 'mongodb';

const jiraClient = new JiraApi({
  protocol: 'https',
  host: 'ott-support.atlassian.net',
  apiVersion: '3',
  username: 'helpdeskott.bot@gmail.com',
  password: ''
})

export default class JiraAPI {
    mongo: Db;

    constructor(mongoConnection: Db) {
      this.mongo = mongoConnection;
    }

    async createIssue(type: string, issueInfo: any): Promise<any> {
      try {
        const dbConfig = (await this.mongo.collection('bot_options').findOne({ _id: 'config' }))!.data
        const issueType = dbConfig.issue.type[type];

        const template = (await this.mongo.collection('issues_templates').findOne({ _id: issueType }))!.data;
        if (isEmpty(template)) {
          return null;
        };

        template.fields.description.content[0].content.push({text: issueInfo.problem, type: 'text'})
        template.fields.summary = `${issueInfo.chat_id}-${issueInfo.user_id}-${issueInfo.timestamp}`
        template.fields.customfield_10034 = issueInfo.user_id
        template.fields.customfield_10036 = `https://t.me/${issueInfo.user_name}`;

        const res = await jiraClient.addNewIssue(template);
        res.status = issueInfo.status || '11';
        Object.assign(res, issueInfo)

        this.mongo.collection('issues').insertOne(res);
        console.log(`Created issue ${res.key}`)
        return res;       
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    async getIssue(issueKey: string): Promise<JiraApi.IssueObject | null>{
      try {
        const res = await jiraClient.getIssue(issueKey);
        return res
      } catch (error) {
        console.error(error)
        return null
      }
    }

    async moveIssue(issueKey: string, id: string): Promise<void> {
      try {
        await jiraClient.transitionIssue(issueKey, { "transition": { "id": id } });
      } catch (error) {
        console.error(error);
      }
    }

    async assignIssue(issueKey: string, assigneName: string) {
      try {
        await jiraClient.updateAssignee(issueKey, assigneName);
      } catch (error) {
        console.error(error)
      }
    }

    async getUsersIssues(id:string) {
      try {
        const res = await jiraClient.searchJira(`assignee="${id}" AND resolution is empty`);
        return res.issues
      } catch (error) {
        console.error(error)
      }
    }
}