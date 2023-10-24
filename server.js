const TelegramBot = require('node-telegram-bot-api');
const cheerio = require('cheerio');
const axios = require('axios');
const moment = require('moment-timezone');

const token = '6391975200:AAEYGhoNzs7W5VyS-v4YZ6pS0uY3WeCk3Ps';
const bot = new TelegramBot(token, { polling: true });

const group = 'ВТ-22-1';
const subgroup = 2; // 1 или 2
const url = `https://rozklad.ztu.edu.ua/schedule/group/${group}`;
const timezone = 'Europe/Kiev';

let messageId;

bot.on('message', async (msg) => {
    update(msg);
});

async function update(msg) {
    const data = await getData();
    // console.log(JSON.stringify(data, null, 2));
    const text = genText(data);
    if(messageId) {
        bot.deleteMessage(msg.chat.id, messageId);
    }
    bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' }).then((message) => {
        messageId = message.message_id;
    });
}

function genText(data) {
    let text = `<b>Поточний час:</b>\n${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}\n\n`;
    text += `<b>${data.day} (${data.table === 0 ? 'І' : 'ІІ'} тиждень)</b>\n`;
    text += `Група ${group} 🤘 підгрупа ${subgroup}\n\n`;
    // let n = 0;
    for (const key in data.schedule) {
        const index = data.schedule[key].length > 1 ? subgroup - 1 : 0
        if (data.schedule[key][index].active) {
            // n++;

            // text += `${n < 2 ? '❌ ' : ''}`;
            // text += `${n === 2 ? '✅ ' : ''}`;
            // text += `${n > 2 ? '🔲 ' : ''}`;

            text += `<b>${key}</b> `;
            // if(n === 2) text += `🕒 Залишилось 45 хв.\n`;
            // else text += `\n`;
            if (data.schedule[key][index].groups) {
                text += `<i>${data.schedule[key][index].groups}</i>\n`;
            }
            if (data.schedule[key][index].subject) {
                text += `<b>${data.schedule[key][index].subject}</b>\n`;
            }
            if (data.schedule[key][index].room_notes || data.schedule[key][index].room) {
                text += `<i>${data.schedule[key][index].room_notes} ${data.schedule[key][index].room}</i>\n`;
            }
            if (data.schedule[key][index].teacher) {
                text += `<b>${data.schedule[key][index].teacher}</b>\n`;
            }
            text += `\n`;
        }
    }
    text += `👉 <a href="${url}">${url}</a>`;

    return text;
}

async function getData() {
    try {
        const response = await axios.get(url);

        const html = response.data;
        const $ = cheerio.load(html);

        const data = { schedule: {}};

        const tableFirstColumnIndex = $(`table.schedule:eq(0) tbody tr th.selected`).index(); // -1 // Поиск порядкового номера активного столбца с классом "selected" в первой таблице. (0, 1, ... или -1 если не найдено)
        const tableSecondColumnIndex = $(`table.schedule:eq(1) tbody tr th.selected`).index(); // 3 // Поиск порядкового номера активного столбца с классом "selected" во второй таблице. (0, 1, ... или -1 если не найдено)
        const tableIndex = tableFirstColumnIndex > tableSecondColumnIndex ? 0 : 1 // порядковый номер активной таблицы в html. Узнаем сейчас первая или вторая неделя (0 или 1)
        const columnIndex = tableFirstColumnIndex > tableSecondColumnIndex ? tableFirstColumnIndex : tableSecondColumnIndex; // порядковый номер активного столбца (1, 2, ...)

        data.table = tableIndex;

        const rows = $(`table.schedule:eq(${tableIndex}) tbody tr`); // все строки активной таблицы
        rows.each((index, row) => {
            const column = $(row).find(`td:eq(${columnIndex-1})`); // выбираем нужную колонку
            if (column.text().trim()) { // если ячейка таблицы не пустая
                data.day = column.attr('day').replace(/\d/g, '').trim(); // записываем day в объект, предварительно очистив его от цифр и пробелов

                const one = column.find(`div.variative`); // общая пара (один елемент)
                const two = column.find(`div.variative div.subgroups div.one`); // подгруппы (два елемента)
                items = two.length ? two : one; // берем нужный список

                const arr = [];
                items.each((ind, item) => {
                    arr[ind] = {
                        index: ind + 1,
                        active: $(item).text().trim() ? true : false,
                        groups: $(item).find('div').eq(0).text().trim() || null,
                        subject: $(item).find('div').eq(1).text().trim() || null,
                        room: $(item).find('div').eq(2).find('span.room').text().trim() || null,
                        room_notes: $(item).find('div').eq(2).contents().first().text().trim() || null,
                        teacher: $(item).find('div').eq(3).text().trim() || null,
                    }
                });
                data.schedule[column.attr('hour')] = arr;
            }
        });

        return data;
    } catch (error) {
        console.error(error);
    }
}