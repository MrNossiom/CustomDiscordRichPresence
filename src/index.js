#!/usr/bin/env node

'use strict';

const RPC = require('discord-rpc');
const configmanager = require('./configmanager');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { clientId: configClientId } = require('./config');
const clientIdRegExp = /^\d{18}$/u;
// Import

const RPClient = new RPC.Client({ transport: 'ipc' });

process.on('unhandledRejection', console.log);

// Get Client ID
const clientIdPrompt = async () => {
	const ClientIDAsk = [
		{
			type: 'input',
			name: 'clientId',
			message: chalk.blue('I need a Client ID...'),
			validate: (input) => { if (!input.match(clientIdRegExp)) return 'No Correct Client ID Provided'; return true; },
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
		configmanager('set', { clientId });

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
	const MenuChoice = [
		{
			type: 'list',
			name: 'mainMenu',
			message: chalk.blue('Use Default or Custom Rich Presence'),
			choices: [
				'Default Rich Presence',
				'Custom Rich Presence',
				'Change Client ID',
			],
		},
	];

	const MenuChoiceAnswer = await inquirer.prompt(MenuChoice);

	if (MenuChoiceAnswer.mainMenu === 'Custom Rich Presence') customRPQuestionsFunc();
	else if (MenuChoiceAnswer.mainMenu === 'Default Rich Presence') defaultRPFunc();
	else if (MenuChoiceAnswer.mainMenu === 'Change Client ID') clientIdReask();
};

const clientIdReask = async () => {
	const newClientId = await clientIdPrompt();

	if (newClientId && newClientId.match(clientIdRegExp)) {
		configmanager('set', { clientId: newClientId });
		console.log(chalk.green(`Changed to: ${newClientId}`));
	} else {
		console.log(chalk.redBright('No correct Client ID Provided'));
	}
	menu();
};

const customRPQuestionsFunc = async () => {
	const config = await configmanager('get');
	const CustomQuestions = [
		{
			type: 'input',
			name: 'details',
			message: chalk.blue('Set the details...'),
			default: config.details,
			validate: (input) => { if (input.length < 2) return 'The input must be more that 2 characters long'; return true; },
		},
		{
			type: 'input',
			name: 'state',
			message: chalk.blue('Set your state...'),
			default: config.state,
			validate: (input) => { if (input.length < 2) return 'The input must be more that 2 characters long'; return true; },
		},
		{
			type: 'input',
			name: 'largeImageKey',
			message: chalk.blue('Set the Large Image Key...'),
			default: config.largeImageKey,
		},
		{
			type: 'input',
			name: 'largeImageText',
			message: chalk.blue('Set the Large Image Text...'),
			default: config.largeImageText,
		},
		{
			type: 'input',
			name: 'smallImageKey',
			message: chalk.blue('Set the Small Image Key'),
			default: config.smallImageKey,
		},
		{
			type: 'input',
			name: 'smallImageText',
			message: chalk.blue('Set the Small Image Text'),
			default: config.smallImageText,
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
		configmanager('set', newCustomRPObj);
	}

	richPresenceSnap(newCustomRPObj);
};

const defaultRPFunc = async () => {
	const options = await configmanager('get');

	richPresenceSnap(options);
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
			message: chalk.blue('Do you want to return to the menu ?'),
			choices: [
				'Yes',
				'No',
				'Quit',
			],
		},
	];
	const startAgainAnswer = await inquirer.prompt(startAgain);

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