const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '6609353588:AAHk8gXzgLj9Q-PQUrMXx-i4-hRxog1vYoA';
const bot = new TelegramBot(token, { polling: true });

const apiPoint = 'https://eng.snet.pw/api/bot'
const apiToken = 'eN#%6FdEW#%7Gfw2$RFy%gd&rf%s@F4z'

let messageId;

bot.on('message', async (msg) => {
    const data = {
        user: msg.chat.username,
        date: msg.date,
        text: msg.text
    }

    const message = `user: ${data.user}; date: ${data.date}; text: ${data.text}`;

    // bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' }).then((message) => {
    //     messageId = message.message_id;
    // });

    bot.sendMessage(msg.chat.id, JSON.stringify(msg, null, 2));

    await axios.post(`${apiPoint}/addWord`, data).then(async response => {
        bot.sendMessage(msg.chat.id, 'ok');
        // bot.sendMessage(msg.chat.id, JSON.stringify(response, null, 2));
        // console.log(JSON.stringify(msg, null, 2));
    }).catch(errors => {
        bot.sendMessage(msg.chat.id, 'error');
        // bot.sendMessage(msg.chat.id, JSON.stringify(errors, null, 2));
        // console.log(JSON.stringify(errors, null, 2));
        console.log(errors);
    })
});