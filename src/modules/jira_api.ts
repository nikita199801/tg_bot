const node_fetch = require('node-fetch')
const mongo = require('./mongo')

import JiraApi from 'jira-client';
const jiraClient = new JiraApi({
  protocol: 'https',
  host: 'ott-support.atlassian.net',
  apiVersion: '3',
  username: 'helpdeskott.bot@gmail.com',
  password: ''
})


export default class JiraAPI {
    async createIssue(type: string): Promise<any> {
      try {
        const db = mongo.getConnection();
        const dbConfig = await db.collection('bot_options').findOne({ _id: 'config' });
        const issueType = dbConfig.data.issue.type[type];
        const template = (await db.collection('issues_templates').findOne({ _id: issueType })).data;
        const res = await jiraClient.addNewIssue(template)
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
}