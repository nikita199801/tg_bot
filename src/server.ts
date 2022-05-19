const express = require('express')
const app = express()
// const config = require('../config.json');
let mongo = require('./modules/mongo')

import JiraAPI from './modules/jira_api';
const api = new JiraAPI();
const port = 3000

app.use(express.json())
app.get('/bot/config', async (req: any, res: any) => {
    const db = mongo.getConnection();
    const result = await db.collection('bot_options').find({_id: 'config'}).toArray();
    res.json(result[0].data)
})


app.post('/new', async (req: any, res: any) => {
    const result = await api.createIssue(req.body.type);
    res.json(result)
})

app.post('/move', async (req: any, res: any) => {
    const result = await api.moveIssue( req.body.key, req.body.id);
    res.send(200, 'OK');
})

async function main(): Promise<void> {
    await mongo.connect();
    app.listen(port, async () => {
        console.log(`App listening on port ${port}`)
        
    })
}

main().catch(console.error);