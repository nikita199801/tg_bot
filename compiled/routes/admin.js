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
const express_1 = require("express");
``;
const mongo_1 = __importDefault(require("../modules/mongo"));
const dbConfig = require('../modules/db_config').create(mongo_1.default);
const router = (0, express_1.Router)();
router
    .get('/config', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const originalConfig = yield dbConfig.getConfigFromStorage();
        res.send(JSON.stringify(originalConfig));
    }
    catch (error) {
        next();
    }
}))
    .post('/config/update', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        yield mongo_1.default.getConnection().collection('bot_options').replaceOne({ _id: 'config' }, { data: data.config });
        res.json({
            result: 'ok',
        });
    }
    catch (error) {
        next();
    }
}))
    .get('/config/panel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.isAuthenticated()) {
            res.render('control_panel');
            next();
            return;
        }
        res.redirect('/');
    }
    catch (error) {
        next();
    }
}));
module.exports = router;
//# sourceMappingURL=admin.js.map