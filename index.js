#!/usr/bin/env node

'use strict';

/* eslint-disable func-style */
/* eslint-disable no-use-before-define */
const RPC = require('discord-rpc');
const { readFile, writeFile } = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { clientId: configClientId } = require('./config');
const path = require('path');
const clientIdRegExp = /^\d{16,20}$/u;
// Import

const RPClient = new RPC.Client({ transport: 'ipc' });

process.on('unhandledRejection', console.log);

// User Questions Script
const start = () => {
	console.clear();
	console.log(chalk.red.bold('---===RP Client===---'));
	console.log(chalk.red.bold('Created by MrNossiom#4596'));
	console.log(chalk.red(`Logged in to user: ${RPClient.user.username}`));
	menu();
};

const menu = async () => {
	const MenuChoice = [
		{
			type: 'list',
			name: 'mainMenu',
			message: chalk.blue('Use Default or Custom Rich Presence'),
			choices: [
				'Default Rich Presence',
				'Custom Rich Presence',
			],
		},
	];

	const MenuChoiceAnswer = await inquirer.prompt(MenuChoice);

	if (MenuChoiceAnswer.mainMenu === 'Custom Rich Presence') customRPQuestionsFunc();
	else if (MenuChoiceAnswer.mainMenu === 'Default Rich Presence') defaultRPFunc();
};

const customRPQuestionsFunc = async () => {
	const CustomQuestions = [
		{
			type: 'input',
			name: 'details',
			message: chalk.blue('Set the details...'),
		},
		{
			type: 'input',
			name: 'state',
			message: chalk.blue('Set your state...'),
		},
		{
			type: 'input',
			name: 'largeImageKey',
			message: chalk.blue('Set the Large Image Key...'),
		},
		{
			type: 'input',
			name: 'largeImageText',
			message: chalk.blue('Set the Large Image Text...'),
		},
		{
			type: 'input',
			name: 'smallImageKey',
			message: chalk.blue('Set the Small Image Key'),
		},
		{
			type: 'input',
			name: 'smallImageText',
			message: chalk.blue('Set the Small Image Text'),
		},
		{
			type: 'list',
			name: 'setDefault',
			message: chalk.blue('Do you want to set this default ?'),
			choices: [
				'Yes',
				'No',
			],
		},
	];

	const CustomQuestionsAnswers = await inquirer.prompt(CustomQuestions);
	const newCustomRPObj = {
		details: CustomQuestionsAnswers.details,
		state: CustomQuestionsAnswers.state,
		largeImageKey: CustomQuestionsAnswers.largeImageKey,
		largeImageText: CustomQuestionsAnswers.largeImageText,
		smallImageKey: CustomQuestionsAnswers.smallImageKey,
		smallImageText: CustomQuestionsAnswers.smallImageText,
	};

	if (CustomQuestionsAnswers.setDefault === 'Yes') {
		writeFile(path.join(__dirname, './defaultRP.json'), JSON.stringify(newCustomRPObj), (err) => {
			if (err) return console.log(err);
		});
	}

	richPresenceSnap(newCustomRPObj);
};

const defaultRPFunc = () => {
	readFile(path.join(__dirname, './defaultRP.json'), 'utf8', (err, jsonString) => {
		if (err) return console.log(err);
		const defaultRP = JSON.parse(jsonString);

		richPresenceSnap(defaultRP);
	});
};

const richPresenceSnap = async (RPObj) => {
	const SetChoice = [
		{
			type: 'list',
			name: 'activate',
			message: chalk.blue('Do you want to activate your Rich Presence with the followings parameters ?'),
			choices: [
				'Yes',
				'No',
			],
		},
	];

	console.log(chalk.blue(`
${RPClient.application ? RPClient.application.name : 'MeTomT'}
Details: ${RPObj.details},
State: ${RPObj.state},
Large Image Key: ${RPObj.largeImageKey},
Large Image Text: ${RPObj.largeImageText},
Small Image Key: ${RPObj.smallImageKey},
Small Image Text: ${RPObj.smallImageText}
	`));
	const SetChoiceAnswer = await inquirer.prompt(SetChoice);

	if (SetChoiceAnswer.activate === 'Yes') setCustomRichPresence(RPObj);
	else start();
};

const startAgainFunc = async () => {
	const startAgain = [
		{
			type: 'list',
			name: 'next',
			message: chalk.blue('Do you want to change again your discord Rich Presence ?'),
			choices: [
				'Yes',
				'No',
			],
		},
	];
	const startAgainAnswer = await inquirer.prompt(startAgain);

	if (startAgainAnswer.next === 'Yes') start();
	else startAgainFunc();
};

// Set User RP
const setCustomRichPresence = (RPObj) => {
	if (!RPObj.startTimestamp) RPObj.startTimestamp = Date.now();

	RPClient.setActivity(RPObj);
	setInterval(() => {
		RPClient.setActivity(RPObj);
	}, 15000);
	console.log(chalk.red('Custom Rich Presence Activated'));
	startAgainFunc();
};

// Get Client ID
const clientIdPrompt = async () => {
	const ClientIDAsk = [
		{
			type: 'input',
			name: 'clientId',
			message: chalk.blue('I need a Client ID...'),
		},
	];

	const ClientIDAnswer = await inquirer.prompt(ClientIDAsk);

	return ClientIDAnswer.clientId;
};

let clientId;
const clientIdProcess = async () => {
	const argument = process.argv[3] || process.argv[2];

	if (argument && argument.match(clientIdRegExp)) clientId = argument;
	else if (configClientId && configClientId.match(clientIdRegExp)) clientId = configClientId;
	else clientId = await clientIdPrompt();
	if (clientId && clientId.match(clientIdRegExp)) {
		writeFile(path.join(__dirname, './config.json'), JSON.stringify({ clientId }), (err) => {
			if (err) return console.log(err);
		});

		login();
	} else {
		console.log('No correct Client ID Provided');
		// eslint-disable-next-line no-process-exit
		process.exit(0);
	}
};

// Login
const login = () => {
	RPClient.login({ clientId });
	RPClient.on('ready', () => start());
};

// Start
clientIdProcess();