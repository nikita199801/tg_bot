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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
let mongo = require('./modules/mongo');
const jira_api_1 = __importDefault(require("./modules/jira_api"));
const api = new jira_api_1.default();
const port = 3000;
app.use(express.json());
app.get('/bot/config', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongo.getConnection();
    const result = yield db.collection('bot_options').find({ _id: 'config' }).toArray();
    res.json(result[0].data);
}));
app.post('/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield api.createIssue(req.body.type);
    res.json(result);
}));
app.post('/move', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield api.moveIssue(req.body.key, req.body.id);
    res.send(200, 'OK');
}));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongo.connect();
        app.listen(port, () => __awaiter(this, void 0, void 0, function* () {
            console.log(`App listening on port ${port}`);
        }));
    });
}
main().catch(console.error);
//# sourceMappingURL=server.js.map