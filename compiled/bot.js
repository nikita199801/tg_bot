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
const server = require("./server");
const TelegramBot = require('node-telegram-bot-api');
const node_fetch = require('node-fetch');
const token = '';
const redis = require('./modules/redis');
class HelpdeskBot {
    getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield node_fetch('http://localhost:3000/bot/config?username=OttBot&password=123');
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
server.startServer().then(() => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield helpdeskBot.getConfig();
    const bot = yield helpdeskBot.runBot(token);
    setInterval(() => checkAssignedIssues(), 5000);
    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = callbackQuery.data;
            const msg = callbackQuery.message;
            const chatId = msg.chat.id;
            if (action.toLowerCase() == 'other') {
                const replyPrompt = yield bot.sendMessage(chatId, "Сообщите Вашу проблему, я передам ее коллегам.", {
                    reply_markup: {
                        force_reply: true,
                    }
                });
            }
            else {
                const menu = createMenu(action.toLowerCase());
                bot.sendMessage(chatId, menu.title, menu.data);
            }
        });
    });
    bot.onText(/\/menu/, (msg) => {
        const chatId = msg.chat.id;
        const options = createMenu('main');
        bot.sendMessage(chatId, options.title, options.data);
    });
    bot.onText(/\/stop/, (msg) => {
        const chatId = msg.chat.id;
        const options = createMenu('main');
        bot.sendMessage(chatId, "Пока!");
    });
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const options = createMenu('main');
        bot.sendMessage(chatId, "Привет, я чат-бот поддержки!");
    });
    bot.onText(/^[A-zА-я0-9]/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        let replyMessageId;
        if (!(0, lodash_1.isNull)(msg.reply_to_message) && !(0, lodash_1.isUndefined)(msg.reply_to_message)) {
            replyMessageId = msg.reply_to_message.message_id;
        }
        if (replyMessageId && (messageId - 1 === replyMessageId)) {
            const res = yield makeCreateIssueReq(msg);
            if (res.message === 'in queue') {
                bot.sendMessage(chatId, `Ваще обращение находится в очереди. Как только появятся свободные операторы, мы Вам сообщим`);
                return;
            }
            bot.sendMessage(chatId, `Ваше обращение зарегистрировано, его номер ${res.id}. Скоро вам ответят`);
        }
    }));
    function createMenu(menuType) {
        const menuConfig = config.menu;
        return {
            data: {
                reply_markup: JSON.stringify({ inline_keyboard: menuConfig[menuType].data }),
            },
            title: menuConfig[menuType].title
        };
    }
    function makeCreateIssueReq(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const problem = msg.text;
            const res = yield node_fetch('http://localhost:3000/issue/new', {
                method: 'post',
                body: JSON.stringify({
                    problem,
                    user_id: msg.from.id,
                    first_name: msg.from.first_name,
                    user_name: msg.from.username,
                    chat_id: msg.chat.id,
                    timestamp: Date.now(),
                    status: '11',
                    type: 'new'
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const body = yield res.json();
            return body;
        });
    }
    function checkAssignedIssues() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield node_fetch('http://localhost:3000/issue/check');
            const issue = yield res.json();
            if ((0, lodash_1.isEmpty)(issue)) {
                return;
            }
            const { chat_id, id } = JSON.parse(issue);
            bot.sendMessage(chat_id, `Ваше обращение зарегистрировано, его номер ${id}. Скоро вам ответят`);
        });
    }
}));
//# sourceMappingURL=bot.js.map