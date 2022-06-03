const node_fetch = require('node-fetch')

import { query } from 'express';
import JiraApi from 'jira-client';
import { isEmpty, isNull, toString } from 'lodash';
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
        template.fields.customfield_10036 = toString(issueInfo.user_id)
        template.fields.customfield_10035 = `https://t.me/${issueInfo.user_name}`;

        const res = await jiraClient.addNewIssue(template);
        Object.assign(res, {
          chatLink: `https://t.me/${issueInfo.user_name}`,
          user_id: toString(issueInfo.user_id)
        });
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

    async assignIssue(issueKey: string, assigneeId: string) {
      try {
        await jiraClient. updateAssigneeWithId(issueKey, assigneeId);
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

    async getUserInfo(userEmail:string): Promise<JiraApi.JsonResponse | null>{
      try {
        const options: JiraApi.SearchUserOptions = {
          //username field is deprecated due to GDPR, 
          //but has not null constraint.
          username: '',
          query: userEmail,
          maxResults: 1
        }

        const res = await jiraClient.searchUsers(options)
        if (isEmpty(res) && isNull(res)) {
          return null;
        }
        return res[0];
      } catch (error) {
        console.error(error)
        return null;
      }
    }
}