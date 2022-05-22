const express = require('express');
const router = express.Router();
const mongo = require('../modules/mongo')
import JiraAPI from '../modules/jira_api';

const api = new JiraAPI(mongo.getConnection());

router.post('/new', async (req: any, res: any) => {
    const result = await api.createIssue(req.body.type, req.body);
    res.json(result)
})

router.post('/move', async (req: any, res: any) => {
    const result = await api.moveIssue( req.body.key, req.body.id);
    res.send(200, 'OK');
})

router.post('/assign', async (req: any, res: any) => {
    const result = await api.assignIssue( req.body.key, req.body.name);
    res.send(200, 'OK');
})

router.get('/user/get/issues', async (req: any, res: any) => {
    const result = await api.getUsersIssues('6286b551ca7d7f0069029bc6');
    res.send(200, 'OK');
})
module.exports = router;