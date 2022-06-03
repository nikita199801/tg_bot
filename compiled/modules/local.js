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
const mongo_1 = __importDefault(require("../modules/mongo"));
const LocalStrategy = require('passport-local');
module.exports = new LocalStrategy(function (username, password, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = mongo_1.default.getConnection();
            const user = yield db.collection('users').findOne({ username: username, password });
            if (!user) {
                return done(null, false);
            }
            return done(null, user, { scope: 'all' });
        }
        catch (error) {
            console.error(error);
            return done(null, false);
        }
    });
});
//# sourceMappingURL=local.js.map