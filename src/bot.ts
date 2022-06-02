import { isEmpty, isNull, isUndefined } from "lodash";
const server = require("./server");

const TelegramBot = require('node-telegram-bot-api');
const node_fetch = require('node-fetch')
const token = '1472577063:AAEiz-o1coZ3G-PxVa_dYkFs_VIjEwkvS8c';

class HelpdeskBot {
  async getConfig() {
    const res = await node_fetch('http://localhost:3000/bot/config?username=OttBot&password=123');
    const config = await res.json();
    return config
  }

  async runBot(token: string) {
    return new TelegramBot(token, {polling: true});
  }
}

const helpdeskBot = new HelpdeskBot();
server.startServer().then(async () => {
  const config = await helpdeskBot.getConfig()
  const bot = await helpdeskBot.runBot(token);
  setInterval(() => checkAssignedIssues(), 5000);
  bot.on('callback_query', async function onCallbackQuery(callbackQuery: any) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    if (action.toLowerCase() == 'other') {
      const replyPrompt = await bot.sendMessage(chatId, "Сообщите Вашу проблему, я передам ее коллегам.", {
        reply_markup: {
          force_reply: true,
        }
      });
  
    } else {
      const menu = createMenu(action.toLowerCase())
      bot.sendMessage(chatId, menu.title, menu.data);
    }
  });
  
  
  bot.onText(/\/menu/, (msg: any) => {
    const chatId = msg.chat.id;
    const options = createMenu('main');
    bot.sendMessage(chatId, options.title, options.data);
  });
  
  bot.onText(/\/stop/, (msg: any) => {
    const chatId = msg.chat.id;
    const options = createMenu('main');
    bot.sendMessage(chatId, "Пока!");
  });
  
  bot.onText(/\/start/, (msg: any) => {
    const chatId = msg.chat.id;
    const options = createMenu('main');
    bot.sendMessage(chatId, "Привет, я чат-бот поддержки!");
  });
  
  bot.onText(/^[A-zА-я0-9]/, async (msg: any) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    let replyMessageId: number | null | undefined;
  
    if (!isNull(msg.reply_to_message) && !isUndefined(msg.reply_to_message)) {
      replyMessageId = msg.reply_to_message.message_id;
    }
    
    if (replyMessageId && (messageId - 1  === replyMessageId)) {
      const res = await makeCreateIssueReq(msg);
      if (res.message === 'in queue') {
        bot.sendMessage(chatId,  `Ваще обращение находится в очереди. Как только появятся свободные операторы, мы Вам сообщим`);
        return;
      }
      bot.sendMessage(chatId,  `Ваше обращение зарегистрировано, его номер ${res.id}. Скоро вам ответят`);
    }
  });
  
  function createMenu(menuType: any) {
    const menuConfig = config.menu;
    return {
      data: {
        reply_markup: JSON.stringify({ inline_keyboard: menuConfig[menuType].data}),
      },
      title: menuConfig[menuType].title
    }
  }
  
  async function makeCreateIssueReq(msg: any) {
    const problem = msg.text;
      const res = await node_fetch('http://localhost:3000/issue/new', {
        method: 'post',
        body: JSON.stringify({
          problem,
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          user_name:  msg.from.username,
          chat_id: msg.chat.id,
          timestamp: Date.now(),
          status: '11',
          type: 'new'
        }),
        headers: {'Content-Type': 'application/json'}
      });
  
      const body = await res.json();
      return body;
  }


  async function checkAssignedIssues() {
    const res = await node_fetch('http://localhost:3000/issue/check');
    const message = await res.json();
    if (isEmpty(message)) {
      return;
    }
    const {chat_id, id, done} = JSON.parse(message);
    if (done) {
      bot.sendMessage(chat_id,  `Ваше обращение под номерм ${id} закрыто.`);
      return;
    }

    bot.sendMessage(chat_id,  `Ваше обращение зарегистрировано, его номер ${id}. Скоро вам ответят`);
  }
});
  