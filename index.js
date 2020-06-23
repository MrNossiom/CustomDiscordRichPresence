const RPC = require('discord-rpc');
const { readFile, writeFile } = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { clientId, clientSecret } = require('./config');
// Import

// User Questions Script
const Start = () => {
	console.clear();
	console.log(chalk.red.bold('---===RP Client===---'));
	console.log(chalk.red.bold('Crée par MrNossiom#4596'));
	Menu();
};

const Menu = async () => {
	const MenuChoice = [
		{
			type: 'list',
			name: 'mainMenu',
			message: chalk.blue('Use Default or Custom Rich Presence'),
			choices: ['Default Rich Presence', 'Custom Rich Presence'],
		},
	];

	const MenuChoiceAnswer = await inquirer.prompt(MenuChoice);
	if (MenuChoiceAnswer.mainMenu == 'Custom Rich Presence') CustomRPQuestionsFunc();
	else if (MenuChoiceAnswer.mainMenu == 'Default Rich Presence') DefaultRPFunc();
};

const CustomRPQuestionsFunc = async () => {
	const CustomQuestions = [
		{
			type: 'input',
			name: 'state',
			message: chalk.blue('Set your state...'),
		},
		{
			type: 'input',
			name: 'details',
			message: chalk.blue('Set the details...'),
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
			choices: ['Yes', 'No'],
		},
	];

	const CustomQuestionsAnswers = await inquirer.prompt(CustomQuestions);
	const newCustomRPObj = {
		state: CustomQuestionsAnswers.state,
		details: CustomQuestionsAnswers.details,
		largeImageKey: CustomQuestionsAnswers.largeImageKey,
		largeImageText: CustomQuestionsAnswers.largeImageText,
		smallImageKey: CustomQuestionsAnswers.smallImageKey,
		smallImageText: CustomQuestionsAnswers.smallImageText,
	};

	if (CustomQuestionsAnswers.setDefault == 'Yes') {
		writeFile('./defaultRP.json', JSON.stringify(newCustomRPObj), err => {
			if (err) return console.log(err);
		});
	}

	RichPresenceSnap(newCustomRPObj);
};

const DefaultRPFunc = async () => {
	readFile('./defaultRP.json', 'utf8', (err, jsonString) => {
		if (err) return console.log(err);
		const defaultRP = JSON.parse(jsonString);
		RichPresenceSnap(defaultRP);
	});
};

const RichPresenceSnap = async (RPObj) => {
	const SetChoice = [
		{
			type: 'list',
			name: 'activate',
			message: chalk.blue('Do you want to activate your Rich Presence with the followings parameters ?'),
			choices: ['Yes', 'No'],
		},
	];
	console.log(chalk.blue(`
State: ${RPObj.state},
Details: ${RPObj.details},
Large Image Key: ${RPObj.largeImageKey},
Large Image Text: ${RPObj.largeImageText},
Small Image Key: ${RPObj.smallImageKey},
Small Image Text: ${RPObj.smallImageText}
	`));
	const SetChoiceAnswer = await inquirer.prompt(SetChoice);
	if (SetChoiceAnswer.activate == 'Yes') setCustomRichPresence(RPObj);
	else Start();
};

const startAgainFunc = async () => {
	const startAgain = [
		{
			type: 'list',
			name: 'next',
			message: chalk.blue('Do you want to change again your discord Rich Presence ?'),
			choices: ['Yes', 'No'],
		},
	];
	const startAgainAnswer = await inquirer.prompt(startAgain);
	if (startAgainAnswer.next == 'Yes') Start();
	else startAgainFunc();
};

// Set User RP
const RPClient = new RPC.Client({ transport: 'ipc' });

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
RPClient.login({ clientId: clientId, clientSecret: clientSecret });
RPClient.on('ready', () => Start());