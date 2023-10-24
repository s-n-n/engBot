const TelegramBot = require('node-telegram-bot-api');
// const cheerio = require('cheerio');
// const axios = require('axios');
// const moment = require('moment-timezone');

const token = '6609353588:AAHk8gXzgLj9Q-PQUrMXx-i4-hRxog1vYoA';
const bot = new TelegramBot(token, { polling: true });

let messageId;

bot.on('message', async (msg) => {
    const text = "test"
    bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' }).then((message) => {
        messageId = message.message_id;
    });
});