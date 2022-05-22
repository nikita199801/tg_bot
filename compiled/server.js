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
const express = require('express');
const app = express();
let mongo = require('./modules/mongo');
const port = 3000;
class Server {
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            app.use(express.json());
            app.get('/bot/config', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const db = mongo.getConnection();
                const result = yield db.collection('bot_options').find({ _id: 'config' }).toArray();
                res.json(result[0].data);
            }));
            yield mongo.connect();
            app.use('/issue/', require('./routes/issues'));
            const server = app.listen(port, () => __awaiter(this, void 0, void 0, function* () {
                console.log(`App listening on port ${port}`);
            }));
            process.on('SIGTERM', () => {
                console.info('SIGTERM signal received.');
                server.close(() => {
                    console.log('Http server closed.');
                    mongo.closeConnection().then(() => {
                        console.info('Process stopped.');
                        process.exit(0);
                    });
                });
            });
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map