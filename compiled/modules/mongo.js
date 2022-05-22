"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { MongoClient } = require('mongodb');
let db;
module.exports.connect = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield MongoClient.connect('mongodb://localhost:6100/');
    db = yield client.db('helpdesk_db');
    console.log("MonogDB connected");
});
module.exports.getConnection = () => {
    return db;
};
module.exports.closeConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    console.info('DB connection closed.');
    MongoClient.close;
});
//# sourceMappingURL=mongo.js.map