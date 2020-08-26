#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import shell from "shelljs";
import fetch from 'node-fetch';

import { DeviceType } from "./enums/DeviceType";
import { OhgScreen } from "./enums/OhgScreen";

const url = 'http://192.168.2.14:8081';

async function fetchData() {
	let response = await fetch(`${url}/full`);
	(<any>global).data = await response.json();
}
setInterval(fetchData, 5000);

async function sendCommand(id: string, command: string) {
	await fetch(`${url}/controll/${id}/${command}`);

	//Update data model
	await fetchData();
}

const init = () => {
	console.log(
		chalk.cyanBright(figlet.textSync("OpenHG", {font: "Doh"}))
		+ "\n" +
		chalk.magentaBright.bold(figlet.textSync("Command Line Interface", {font: "Cybermedium"}))
	);
}

const chooseRoom = () => {
	let choices: any[] = [];
	for (let i in (<any>global).data) {
		let curRoom: any = (<any>global).data[i];
		choices.push({
			name: curRoom.Name,
			value: curRoom.id
		});
	}

	const questions: inquirer.QuestionCollection = [
		{
			type: "list",
			name: "ROOM",
			message: "Room: ",
			choices
		}
	];
	return inquirer.prompt(questions);
};

const chooseDevice = (id: string) => {
	let choices: any[] = [];
	for (let d in (<any>global).curRoom.Devices) {
		let curDev: any = (<any>global).curRoom.Devices[d];

		let suffix: string = '';
		switch (<DeviceType>curDev.Type) {
			case DeviceType.Toggle:
				if (curDev.Status) suffix = chalk.green('On');
				else suffix = chalk.red('Off');
				break;

			case DeviceType.RGB:
				if (curDev.Status) suffix = chalk.hex(curDev.Color)('On');
				else suffix = chalk.red('Off');
				break;
		}

		choices.push({
			name: `${curDev.Name} ${suffix}`,
			value: curDev.id
		});
	}
	choices.push({ name: chalk.inverse('Go back'), value: '' });

	const questions: inquirer.QuestionCollection = [
		{
			type: "list",
			name: "DEVICE",
			message: "Device: ",
			choices
		}
	];
	return inquirer.prompt(questions);
};

const chooseRGBMenu = () => {
	let choices: any[] = [];
	choices.push({ name: 'Lighten', value: 'lighten' });
	choices.push({ name: 'Darken', value: 'darken' });
	choices.push({ name: 'Turn on', value: 'on' });
	choices.push({ name: 'Turn off', value: 'off' });
	choices.push({ name: 'Set color', value: 'pickColor' });
	choices.push({ name: chalk.inverse('Go back'), value: '' });

	const questions: inquirer.QuestionCollection = [
		{
			type: "list",
			name: "RGBCMD",
			message: "",
			choices
		}
	];
	return inquirer.prompt(questions);
};

const chooseColor = () => {
	let colors: string[] = ['7affd2', '7aff83', 'ffc97a', 'b87aff', '8e7aff', '7aa4ff'];

	let choices: any[] = [];
	for (let i in colors) {
		choices.push({ name: `Set ${(<any>global).curDev.Name} to ` + chalk.hex(colors[i])('■'), value: colors[i] });
	}
	choices.push({ name: chalk.inverse('Go back'), value: '' });

	const questions: inquirer.QuestionCollection = [
		{
			type: "list",
			name: "COLOR",
			message: "",
			choices
		}
	];
	return inquirer.prompt(questions);
};

const run = async () => {
	console.clear();
	init();
	await fetchData();

	let curScreen: OhgScreen;

	while (true) {
		console.clear();
		init();

		switch (curScreen) {
			default:
			case OhgScreen.Room:
				const { ROOM } = await chooseRoom();

				for (let i in (<any>global).data) {
					let curRoom: any = (<any>global).data[i];
					if(curRoom.id == ROOM) {
						(<any>global).curRoom = curRoom;
						break;
					}
				}

				curScreen = OhgScreen.Device;

				break;

			case OhgScreen.Device:
				console.log(chalk.bold.inverse((<any>global).curRoom.Name))
				const { DEVICE } = await chooseDevice((<any>global).curRoom.id);

				if (DEVICE != '') {

					for (let i in (<any>global).curRoom.Devices) {
						let curDev: any = (<any>global).curRoom.Devices[i];
						if (curDev.id == DEVICE) {
							(<any>global).curDev = curDev;
							break;
						}
					}

					switch (<DeviceType>(<any>global).curDev.Type) {
						case DeviceType.Toggle:
							await sendCommand((<any>global).curDev.id, 'toggle');
							break;

						case DeviceType.RGB:
							curScreen = OhgScreen.RGBMenu
							break;
					}
				}
				else
					curScreen = OhgScreen.Room;
				break;

			case OhgScreen.RGBMenu:
				console.log(chalk.bold.inverse((<any>global).curDev.Name))
				const { RGBCMD } = await chooseRGBMenu();

				switch (RGBCMD) {
					case '':
						curScreen = OhgScreen.Device;
						break;

					case 'pickColor':
						curScreen = OhgScreen.ColorPicker;
						break;

					default:
						//Fire and forget
						await sendCommand((<any>global).curDev.id, RGBCMD);
						curScreen = OhgScreen.Device
						break;
				}
				break;

			case OhgScreen.ColorPicker:
				console.log(chalk.bold.inverse((<any>global).curDev.Name))
				const { COLOR } = await chooseColor();

				switch (COLOR) {
					case '':
						curScreen = OhgScreen.RGBMenu;
						break;

					default:
						await sendCommand((<any>global).curDev.id, COLOR);
						curScreen = OhgScreen.Device;
						break;
				}
				break;
		}
	}
};

run();