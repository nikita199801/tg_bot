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
const passport_1 = __importDefault(require("passport"));
const router = require('express').Router();
router
    .post('/login', passport_1.default.authenticate('password', { session: true }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.isAuthenticated()) {
        const { user } = req.session.passport;
        res.redirect(`/profile/dashboard/${user}`);
    }
}))
    .post('/logout', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.logout(function (err) {
        res.redirect('/');
    });
}));
module.exports = router;
//# sourceMappingURL=auth.js.map