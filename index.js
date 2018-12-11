require('dotenv').config();

// const http = require('http')
const TeleBot = require('telebot');
const express = require('express');
const { evolve, assoc } = require('ramda');

const { 
	startMsg, btnText, successMsg, codeMsg, nameMsg, 
	nameMsgError, phoneMsg, phoneMsgError, cityMsg, cityMsgError 
} = require('./texts');
const { sendEmail } = require('./mail');


const bot = new TeleBot({
	token: process.env.API_KEY,
	usePlugins: ['askUser']
});

let usersData = {};

const saveUserData = (id, key, value) => {
	usersData = evolve({
		[id]: assoc(key, value)
	})(usersData);
};

bot.on(['/start'], (msg) => {
	bot.sendMessage(msg.from.id, startMsg, {
		parseMode: 'html',
		markup: bot.inlineKeyboard([
	        [bot.inlineButton(btnText, {callback: 'accept'})]
	    ])
	});
});


bot.on('callbackQuery', msg => {
	const { data, from: { id: userId } } = msg;

	if (msg.data !== 'accept') return;

	usersData[userId] = {};

	bot.sendMessage(userId, codeMsg, {ask: 'code'});

});

bot.on('ask.code', msg => {
	const { text: code, from: { id: userId } } = msg;

	saveUserData(userId, 'code', code);

    bot.sendMessage(userId, nameMsg, {ask: 'name'});
});

bot.on('ask.name', msg => {
	const { text: name, from: { id: userId } } = msg;
	const regExp = /\S+\s+\S+\s+\S+/;

	saveUserData(userId, 'name', name);

	name.length < 8 || !regExp.test(name) 
		? bot.sendMessage(userId, nameMsgError, {ask: 'name'})
		: bot.sendMessage(userId, phoneMsg, {ask: 'phone'});
});

bot.on('ask.phone', msg => {
	let { text: phone, from: { id: userId } } = msg;
	const regExp = /\s{0,2}/;

	phone = phone.match(/\d+/g, '').join('');

	saveUserData(userId, 'phone', phone);

	phone.length === 10 || phone.length === 12
		? bot.sendMessage(userId, cityMsg, {ask: 'city'})
		: bot.sendMessage(userId, phoneMsgError, {ask: 'phone'});

});

bot.on('ask.city', msg => {
	let { text: city, from: { id: userId } } = msg;

	saveUserData(userId, 'city', city);

	if (city.length < 2) {
		bot.sendMessage(userId, cityMsgError, {ask: 'city'});
	} else {
		sendEmail(usersData[userId])
			.then(_ => bot.sendMessage(userId, successMsg));
	}
});

bot.start();

// const server = http.createServer((req, res) => res.end('Hello Node.js Server!'));

// server.listen(process.env.PORT, (err) => {
//   if (err) {
//     return console.log('something bad happened', err)
//   }

//   console.log(`server is listening on ${process.env.PORT}`)
// })


