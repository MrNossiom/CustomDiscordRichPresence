#!/usr/bin/env node

'use strict';

/* eslint-disable no-use-before-define */

// Discord RPC
const RPC = require('discord-rpc');

// CLI
const chalk = require('chalk');
const inquirer = require('inquirer');

// Modules
const questions = require('./questions');

// Config
const ConfigManager = require('./ConfigManager');
const { clientId: configClientId } = require('./config');

// RexExp
const clientIdRegExp = /^\d{18}$/u;

// Initialization
const RPClient = new RPC.Client({ transport: 'ipc' });
const config = new ConfigManager();

process.on('unhandledRejection', (message) => {
	if (process.env.NODE_ENV === 'production') return;
	console.log(message);
});

// Get Client ID
const clientIdPrompt = async () => {
	const ClientIDAnswer = await inquirer.prompt(questions.clientId);

	return ClientIDAnswer.clientId;
};

let clientId;
const clientIdProcess = async () => {
	const argument = process.argv[3] || process.argv[2];

	if (argument && argument.match(clientIdRegExp)) clientId = argument;
	else if (configClientId && configClientId.match(clientIdRegExp)) clientId = configClientId;
	else clientId = await clientIdPrompt();
	if (clientId && clientId.match(clientIdRegExp)) {
		config.current = { clientId };

		login();
	} else {
		console.log('No correct Client ID Provided');
		process.exit(0);
	}
};

// User Questions Script
const start = () => {
	console.clear();
	console.log(chalk.red.bold('---===RP Client===---'));
	console.log(chalk.red.bold('Created by MrNossiom#4596'));
	console.log(chalk.red('More information on https://github.com/MrNossiom/custom-discord-rp#readme'));
	console.log(chalk.red(`Logged in with Client ID: ${clientId}`));
	console.log(chalk.red(`Logged in to user: ${RPClient.user.username}`));

	menu();
};

const menu = async () => {
	const MenuChoiceAnswer = await inquirer.prompt(questions.menuChoice);

	if (MenuChoiceAnswer.mainMenu === 'Custom Rich Presence') customRPQuestionsFunc();
	else if (MenuChoiceAnswer.mainMenu === 'Default Rich Presence') defaultRPFunc();
	else if (MenuChoiceAnswer.mainMenu === 'Change Client ID') clientIdReAsk();
};

const clientIdReAsk = async () => {
	const newClientId = await clientIdPrompt();

	if (newClientId && newClientId.match(clientIdRegExp)) {
		config.current = { clientId: newClientId };
		console.log(chalk.green(`Changed to: ${newClientId}`));
	} else {
		console.log(chalk.redBright('No correct Client ID Provided'));
	}
	menu();
};

const customRPQuestionsFunc = async () => {
	const CustomQuestionsAnswers = await inquirer.prompt(await questions.customQuestions());
	const newCustomRPObj = {
		details: CustomQuestionsAnswers.details,
		state: CustomQuestionsAnswers.state,
		largeImageKey: CustomQuestionsAnswers.largeImageKey,
		largeImageText: CustomQuestionsAnswers.largeImageText,
		smallImageKey: CustomQuestionsAnswers.smallImageKey,
		smallImageText: CustomQuestionsAnswers.smallImageText,
	};

	if (CustomQuestionsAnswers.setDefault === 'Yes') {
		config.current = newCustomRPObj;
	}

	richPresenceSnap(newCustomRPObj);
};

const defaultRPFunc = () => {
	const options = config.current;

	richPresenceSnap(options);
};

const richPresenceSnap = async (RPObj) => {
	console.log(chalk.blue(`
${RPClient.application ? RPClient.application.name : 'MeTomT'}
Details: ${RPObj.details},
State: ${RPObj.state},
Large Image Key: ${RPObj.largeImageKey},
Large Image Text: ${RPObj.largeImageText},
Small Image Key: ${RPObj.smallImageKey},
Small Image Text: ${RPObj.smallImageText}
	`));
	const SetChoiceAnswer = await inquirer.prompt(questions.setChoice);

	if (SetChoiceAnswer.activate === 'Yes') setCustomRichPresence(RPObj);
	else start();
};

const startAgainFunc = async () => {
	const startAgainAnswer = await inquirer.prompt(questions.startAgain);

	if (startAgainAnswer.next === 'Yes') start();
	else if (startAgainAnswer.next === 'Quit') process.exit(0);
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

// Login
const login = () => {
	RPClient.login({ clientId });
	RPClient.on('ready', () => start());
};

// Start
clientIdProcess();