const TelegramBot = require('node-telegram-bot-api');
const node_fetch = require('node-fetch')

const token = '12';

class HelpdeskBot {
  async getConfig() {
    const res = await node_fetch('http://localhost:3000/');
    const config =  await res.json();
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
  bot.on('text', (msg: any) => {
    const chatId = msg.chat.id;
    const options = createMenu('main');
    bot.sendMessage(chatId, options.title, options.data);
  });
  
  bot.on('callback_query', function onCallbackQuery(callbackQuery: any) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const menu = createMenu(action.toLowerCase())
    bot.sendMessage(chatId, menu.title, menu.data);
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
})();


  