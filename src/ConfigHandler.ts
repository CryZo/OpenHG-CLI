import fs from 'fs';
import inquirer from "inquirer";
import chalk from "chalk";

import { IConfigData } from "./IConfigData";

export class ConfigHandler {
	filePath: string = `${require('os').homedir()}/.openhg-cli.config`;
	config: IConfigData = {
		backendUrl: ''
	};

	constructor() {
	}

	async loadConfig() {
		if (fs.existsSync(this.filePath)) {
			this.config = JSON.parse(fs.readFileSync(this.filePath, { encoding: 'utf8' }));
		}
		else {
			await this.createNewConfig();
		}
	}

	async createNewConfig() {
		console.log(`Welcome to ${chalk.red('OpenHG-CLI')}! It seems like you run me the first time. This wizard will guide you through the configiration progress.`);
		let answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'url',
				message: "OpenHG's FULL url (eg. http://192.168.0.0:8081):",
			}
		]);

		this.config.backendUrl = answers.url;
		fs.writeFileSync(this.filePath, JSON.stringify(this.config));
		
		await this.loadConfig();
	}
}