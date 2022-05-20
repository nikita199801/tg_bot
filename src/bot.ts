import { isNull, isUndefined } from "lodash";

const TelegramBot = require('node-telegram-bot-api');
const node_fetch = require('node-fetch')

const token = '';

class HelpdeskBot {
  async getConfig() {
    const res = await node_fetch('http://localhost:3000/bot/config');
    const config = await res.json();
    return config
  }

  async runBot(token: string) {
    return new TelegramBot(token, {polling: true});
  }
}

const helpdeskBot = new HelpdeskBot();
(async () => {
  const config = await helpdeskBot.getConfig()
  const bot = await helpdeskBot.runBot(token);
  
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
          userId: msg.from.id,
          first_name: msg.from.first_name,
          type: 'new'
        }),
        headers: {'Content-Type': 'application/json'}
      });

      const body = await res.json();
      return body;
  }
})();


  