require('dotenv').config();

// const http = require('http')
const TeleBot = require('telebot');
const express = require('express');
const { evolve, assoc } = require('ramda');

const { getTr } = require('./texts');
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

const msgHandler = (msg, type, nextType, isInvalid) => {
	const { text, from: { id: userId } } = msg;
	const trKey = isInvalid ? `${type}_error` : nextType;
	const ask = isInvalid ? type : nextType;

	type && saveUserData(userId, type, text);

	bot.sendMessage(userId, getTr(trKey), {ask})
		.catch(console.log);	
};

bot.on(['/start'], (msg) => {
	bot.sendMessage(msg.from.id, getTr('welcome'), {
		parseMode: 'html',
		markup: bot.inlineKeyboard([
	        [bot.inlineButton(getTr('btn'), {callback: 'accept'})]
	    ])
	});
});

bot.on('callbackQuery', msg => {
	const { data, from: { id: userId } } = msg;

	if (msg.data !== 'accept') return;

	usersData[userId] = { id: userId };

	msgHandler(msg, '', 'code');
});

bot.on('ask.code', msg => msgHandler(msg, 'code', 'name'));

bot.on('ask.name', msg => {
	const { text } = msg;
	const regExp = /\S+\s+\S+\s+\S+/;
	const isInvalid = text.length < 8 || !regExp.test(text);
	
	msgHandler(msg, 'name', 'birthday', isInvalid);
	console.log(usersData);
});

bot.on('ask.birthday', msg => msgHandler(msg, 'birthday', 'birthdayPlace'));

bot.on('ask.birthdayPlace', msg => msgHandler(msg, 'birthdayPlace', 'registration'));

bot.on('ask.registration', msg => msgHandler(msg, 'registration', 'livingPlace'));

bot.on('ask.livingPlace', msg => msgHandler(msg, 'livingPlace', 'passport'));

bot.on('ask.passport', msg => msgHandler(msg, 'passport', 'phone'));

bot.on('ask.phone', msg => {
	const regExp = /\s{0,2}/;
	const phone = (msg.text.match(/\d+/g, '') || []).join('');
	const isValid = phone.length === 10 || phone.length === 12;

	msgHandler(msg, 'phone', 'email', !isValid);
});

bot.on('ask.email', msg => {
	const { text, from: { id: userId } } = msg;

	saveUserData(userId, 'email', text);

	sendEmail(usersData[userId])
		.then(_ => bot.sendMessage(userId, getTr(`success`)))
		.catch(console.log);
		
});

bot.start();

