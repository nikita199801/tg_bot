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
const lodash_1 = require("lodash");
const config = require('config');
const dummy = require('../../config/dummy.json');
function validate(config) {
    return !(0, lodash_1.isEmpty)(config) && (0, lodash_1.isObject)(config);
}
let dbConfig;
module.exports.create = function (mongo) {
    function getConfigFromStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = (yield mongo.getConnection().collection('bot_options').findOne({ _id: 'config' })).data;
            if (!validate(config)) {
                return dummy;
            }
            dbConfig = config;
            return config;
        });
    }
    function getConfig() {
        if (dbConfig) {
            return Promise.resolve(dbConfig);
        }
        return getConfigFromStorage();
    }
    return {
        updateConfig(rConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!validate(rConfig)) {
                    return Promise.reject(new Error('Incorrect config'));
                }
                yield mongo.getConnection().collection('bot_options').updateOne({ _id: 'config' }, rConfig);
                dbConfig = rConfig;
                return console.info('Config was updated and overriden');
            });
        },
        middleware(req, res, next) {
            getConfig()
                .then((config) => {
                req.config = config;
                res.locals.dbConfig = config;
                next();
            });
        },
        getConfig,
        getConfigFromStorage,
    };
};
//# sourceMappingURL=db_config.js.map