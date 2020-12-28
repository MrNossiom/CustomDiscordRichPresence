// CLI
const chalk = require('chalk');

// Config
const config = require('./ConfigManager');

// RegExp
const clientIdRegExp = /^\d{18}$/u;

module.exports.clientId = [
	{
		type: 'input',
		name: 'clientId',
		message: chalk.blue('I need a Client ID...'),
		validate: (input) => !input.match(clientIdRegExp) ? 'No Correct Client ID Provided' : true,
	},
];

module.exports.menuChoice = [
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

module.exports.customQuestions = () => {
	const oldConfig = config.current;

	return [
		{
			type: 'input',
			name: 'details',
			message: chalk.blue('Set the details...'),
			default: oldConfig.details,
			validate: (input) => input.length < 2 ? 'The input must be more that 2 characters long' : true,
		},
		{
			type: 'input',
			name: 'state',
			message: chalk.blue('Set your state...'),
			default: oldConfig.state,
			validate: (input) => input.length < 2 ? 'The input must be more that 2 characters long' : true,
		},
		{
			type: 'input',
			name: 'largeImageKey',
			message: chalk.blue('Set the Large Image Key...'),
			default: oldConfig.largeImageKey,
		},
		{
			type: 'input',
			name: 'largeImageText',
			message: chalk.blue('Set the Large Image Text...'),
			default: oldConfig.largeImageText,
		},
		{
			type: 'input',
			name: 'smallImageKey',
			message: chalk.blue('Set the Small Image Key'),
			default: oldConfig.smallImageKey,
		},
		{
			type: 'input',
			name: 'smallImageText',
			message: chalk.blue('Set the Small Image Text'),
			default: oldConfig.smallImageText,
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
};

module.exports.setChoice = [
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

module.exports.startAgain = [
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