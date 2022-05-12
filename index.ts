const TelegramBot = require('node-telegram-bot-api');

// const token =;

const bot = new TelegramBot(token, {polling: true});

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const options = {
        // reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
        inline_keyboard: 
        [
            [{text: 'Вопросы по возврату', callback_data: 'REFUND'}],
            [{text: 'Вопросы по оформлению', callback_data: 'BUY'}],
            [{text: 'Справочная информация', callback_data: 'INFO'}],
            [{text: 'Другое', callback_data: 'OTHER'}]
        ]
    })
  };
  
    bot.sendMessage(chatId, 'Выберите тип обращения', options);
  });

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    let text;
  
    if (action === 'REFUND') {
      text = 'You hit button';
    }
  
    bot.editMessageText(text, opts);
  });

  
  