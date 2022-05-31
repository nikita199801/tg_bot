import { Db } from "mongodb";
const { MongoClient } = require('mongodb')

let db: Db;

const mongo = {
    connect : async () => {
        const client = await MongoClient.connect('mongodb://localhost:6100/')
        db = await client.db('helpdesk_db');
        console.log("MonogDB connected")
    },

    getConnection: () => {
        return db
    },

    closeConnection: async () => {
        console.info('DB connection closed.')
        MongoClient.close
    }

}

export default mongo;