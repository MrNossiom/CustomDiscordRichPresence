const { readFile, writeFile } = require('fs');
const path = require('path');
// Import

module.exports = (method, options = {}) => new Promise((yes, no) => {
	if (method === 'set') {
		readFile(path.join(__dirname, './config.json'), 'utf8', (err, jsonString) => {
			if (err) return no(err);

			const newConfig = Object.assign(JSON.parse(jsonString), options);

			writeFile(path.join(__dirname, './config.json'), JSON.stringify(newConfig), (err) => {
				if (err) return no(err);
			});
		});
	} else if (method === 'get') {
		readFile(path.join(__dirname, './config.json'), 'utf8', (err, jsonString) => {
			if (err) return no(err);
			const config = JSON.parse(jsonString);

			return yes(config);
		});
	} else {
		throw new Error('The only options are \'set\' or \'get\'');
	}
});