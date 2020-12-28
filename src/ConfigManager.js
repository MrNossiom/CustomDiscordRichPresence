const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

class ConfigManager {
	constructor() {
		readFileSync(path.join(__dirname, './config.json'), 'utf8', (error, json) => {
			if (error) return;

			const config = JSON.parse(json);

			this.current = config;
		});
	}

	get current() {
		let current;

		readFileSync(path.join(__dirname, './config.json'), 'utf8', (error, json) => {
			if (error) return;

			const config = JSON.parse(json);

			current = config;
		});

		return current;
	}

	set current(options = {}) {
		readFileSync(path.join(__dirname, './config.json'), 'utf8', (error, json) => {
			if (error) return;

			const newConfig = Object.assign(JSON.parse(json), options);

			writeFileSync(path.join(__dirname, './config.json'), JSON.stringify(newConfig));
		});
	}
}

module.exports = ConfigManager;