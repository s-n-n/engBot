const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment-timezone');
const axios = require('axios');

const token = '6609353588:AAHk8gXzgLj9Q-PQUrMXx-i4-hRxog1vYoA';
const bot = new TelegramBot(token, { polling: true });

const apiPoint = 'https://eng.snet.pw/api/bot'
// const apiPoint = 'http://localhost:8080/api/bot'
const apiToken = 'eN#%6FdEW#%7Gfw2$RFy%gd&rf%s@F4z'
const timezone = 'Europe/Kiev';

// let messageId;
let savedAction = [];

bot.on('message', async (msg) => {

    // console.log('1-------------------');
    // console.log(savedAction);
    // console.log('2-------------------');

    let data = {}
    if (['y', 'Y'].includes(msg.text.trim()) && savedAction[msg.chat.username]) {
        data = {
            ...savedAction[msg.chat.username],
            rewrite: true
            // word: arr[0] ? arr[0].trim() : null,
            // translate: arr[1] ? arr[1].trim() : null
        }
    } else {
        const arr = msg.text.split('|')
        data = {
            username: msg.chat.username,
            date: moment.unix(msg.date).tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
            word: arr[0] ? arr[0].trim() : null,
            translate: arr[1] ? arr[1].trim() : null
        }
    }

    // const message = `user: ${data.username}\ndate: ${data.date}\nword: ${data.word}\ntranslate: ${data.translate}`;


    // bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' }).then((message) => {
    //     messageId = message.message_id;
    // });

    // bot.sendMessage(msg.chat.id, JSON.stringify(msg, null, 2));

    await axios.post(`${apiPoint}/addWord`, data).then(async response => {
        // bot.sendMessage(msg.chat.id, 'ok');
        // bot.sendMessage(msg.chat.id, message);
        // bot.sendMessage(msg.chat.id, JSON.stringify(data, null, 2));
        // console.log('1-------------------');
        // console.log(savedAction);
        // console.log('2-------------------');
        // bot.sendMessage(msg.chat.id, JSON.stringify(response.data, null, 2));

        let res_msg
        if(response.data.status === 1) {
            res_msg = `telegram username '<b>${data.username}</b>' not found.`
        } else if(response.data.status === 2) {
            res_msg = `incorrect input.`
        } else if(response.data.status === 3) {
            res_msg = `word not found.`
        } else if(response.data.status === 4) {
            res_msg = `user: ${response.data.data.User.name}\ndate: ${moment(response.data.data.created_at).format('YYYY-MM-DD HH:mm:ss')}\nword: ${response.data.data.word}\ntranslate: ${response.data.data.translate}`;
        } else if(response.data.status === 5) {
            res_msg = `word added.`;
        } else if(response.data.status === 6) {
            // bot.sendMessage(msg.chat.id, JSON.stringify(data, null, 2));
            savedAction[msg.chat.username] = data
            res_msg = `already exists. rewrite the word? (y/Y)`;
        } else if(response.data.status === 7) {
            savedAction[msg.chat.username] = null
            res_msg = `word rewritten.`;
        } else {
            res_msg = `error.`;
        }

        // bot.sendMessage(msg.chat.id, res_msg, { parse_mode: 'HTML' }).then((message) => {
        //     messageId = message.message_id;
        // });
        bot.sendMessage(msg.chat.id, res_msg, { parse_mode: 'HTML' });
        // console.log(JSON.stringify(msg, null, 2));
    }).catch(errors => {
        bot.sendMessage(msg.chat.id, 'error');
        // bot.sendMessage(msg.chat.id, JSON.stringify(errors, null, 2));
        // console.log(JSON.stringify(errors, null, 2));
        console.log(errors);
    })
});