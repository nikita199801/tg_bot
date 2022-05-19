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
const TelegramBot = require('node-telegram-bot-api');
const node_fetch = require('node-fetch');
const token = '12';
class HelpdeskBot {
    getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield node_fetch('http://localhost:3000/bot/config');
            const config = yield res.json();
            return config;
        });
    }
    runBot(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new TelegramBot(token, { polling: true });
        });
    }
}
const helpdeskBot = new HelpdeskBot();
(() => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield helpdeskBot.getConfig();
    const bot = yield helpdeskBot.runBot(token);
    bot.on('text', (msg) => {
        const chatId = msg.chat.id;
        const options = createMenu('main');
        bot.sendMessage(chatId, options.title, options.data);
    });
    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const menu = createMenu(action.toLowerCase());
        bot.sendMessage(chatId, menu.title, menu.data);
    });
    function createMenu(menuType) {
        const menuConfig = config.menu;
        return {
            data: {
                reply_markup: JSON.stringify({ inline_keyboard: menuConfig[menuType].data }),
            },
            title: menuConfig[menuType].title
        };
    }
}))();
//# sourceMappingURL=bot.js.map