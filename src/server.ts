const express = require('express')
const app = express()
// const config = require('../config.json');
let mongo = require('./modules/mongo');
const port = 3000

export default class Server {
    async startServer() {
        app.use(express.json())
        
        app.get('/bot/config', async (req: any, res: any) => {
            const db = mongo.getConnection();
            const result = await db.collection('bot_options').find({_id: 'config'}).toArray();
            res.json(result[0].data)
        })
        await mongo.connect();
        app.use('/issue/', require('./routes/issues'));
        const server = app.listen(port, async () => {
            console.log(`App listening on port ${port}`)
            
        })
        
        process.on('SIGTERM', () => {
            console.info('SIGTERM signal received.');
            server.close(() => {
                console.log('Http server closed.');
                mongo.closeConnection().then(() => {
                    console.info('Process stopped.')
                    process.exit(0)
                })
            })
        })      
    }
}
