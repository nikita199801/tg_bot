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
const express = require('express');
const app = express();
let mongo = require('./modules/mongo');
let issues = require('./routes/issues');
const port = 3000;
app.use(express.json());
app.use('/issue/', issues);
app.get('/bot/config', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = mongo.getConnection();
    const result = yield db.collection('bot_options').find({ _id: 'config' }).toArray();
    res.json(result[0].data);
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