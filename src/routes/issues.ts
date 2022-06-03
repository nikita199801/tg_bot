import mongo from "../modules/mongo"; 
import JiraAPI from '../modules/jira_api';

const express = require('express');
const router = express.Router();
const redis = require('../modules/redis');
const api = new JiraAPI(mongo.getConnection());
const issueStrategy = require('../modules/strategy').create(mongo, redis, api)

router
    .post('/new', async (req: any, res: any) => {
        try {
            const result = await issueStrategy.createIssue(req.body.type, req.body);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }
    })

    //Endpoint for move issue "In Progress"
    .post('/move', async (req: any, res: any) => {
        try {
            await api.moveIssue(req.body.key, req.body.id);
            res.sendStatus(201);
        } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }
    })

    .post('/stats', async (req: any, res: any) => {
        try {
            const data = req.body;;
            await issueStrategy.saveStatistics(data);
            res.sendStatus(201);
        } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }
    })

    //Endpoint for moving issue to done
    .post('/close', async (req: any, res: any) => {
        try {
            const message: {done: boolean, id?: string | number, chat_id?: number | null} = {done: false}
            const { key, id, jiraId, chatId } = req.body
            issueStrategy.updateIssueCounter(jiraId, 'decr')
            api.moveIssue(key, id);
            message.chat_id = parseInt(chatId, 10);
            message.done = true;
            message.id = key
            issueStrategy.storeInMemory('message', message)
            await issueStrategy.updateIssue(key, { status: id })
            res.sendStatus(201);
        } catch (error) {
            console.error(error)
            res.sendStatus(500);
        }
    })

    .post('/assign', async (req: any, res: any) => {
        try {
            await api.assignIssue(req.body.key, req.body.name);
            res.sendStatus(201);
        } catch (error) {
            console.error(error);
        }
    })

    // .get('/user/get/issues', async (req: any, res: any) => {
    //     const result = await api.getUsersIssues('6286b551ca7d7f0069029bc6');
    //     res.send(200, 'OK');
    // })

    // .get('/user', async (req: any, res: any) => {
    //     const userInfo = await api.getUserInfo('helpdeskott.bot@gmail.com');
    //     if (!userInfo) {
    //         return null
    //     }
    //     res.send(200, 'OK');
    // })

    //Endpoint for queue check (used explicitly by bot)
    .get('/check', async (req: any, res: any) => {
        try {
            const issue = await issueStrategy.fetchKeyFromStorage('message');
            if (!issue) {
                return res.json({});
            }
            res.json(issue);
        } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }
    })


module.exports = router;