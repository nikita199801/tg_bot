const express = require('express')
const app = express()
// const config = require('../config.json');
let mongo = require('./modules/mongo');
let issues = require('./routes/issues');
const port = 3000

app.use(express.json())
app.use('/issue/', issues);

app.get('/bot/config', async (req: any, res: any) => {
    const db = mongo.getConnection();
    const result = await db.collection('bot_options').find({_id: 'config'}).toArray();
    res.json(result[0].data)
})

async function main(): Promise<void> {
    await mongo.connect();
    app.listen(port, async () => {
        console.log(`App listening on port ${port}`)
        
    })
}

main().catch(console.error);