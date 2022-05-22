import { Db } from "mongodb";
const { MongoClient } = require('mongodb')

let db: Db;
module.exports.connect = async () => {
    const client = await MongoClient.connect('mongodb://localhost:6100/')
    db = await client.db('helpdesk_db');
    console.log("MonogDB connected")
};

module.exports.getConnection = () => {
    return db
}

module.exports.closeConnection = async () => {
    console.info('DB connection closed.')
    MongoClient.close
}