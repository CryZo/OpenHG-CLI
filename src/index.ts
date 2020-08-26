#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import shell from "shelljs";
import fetch from 'node-fetch';

import { DeviceType } from "./enums/DeviceType";
import { OhgScreen } from "./enums/OhgScreen";
import { Data } from "./Data";
import { MenuData } from "./MenuData";

const DataHandler = new Data('http://192.168.2.14:8081');

const drawLogo = () => {
	console.log(
		chalk.cyanBright(figlet.textSync("OpenHG", {font: "Doh"}))
		+ "\n" +
		chalk.magentaBright.bold(figlet.textSync("Command Line Interface", {font: "Cybermedium"}))
	);
}

const mainLoop = async () => {
	console.clear();
	drawLogo();
	await DataHandler.fetchData();

	let curScreen: OhgScreen;

	while (true) {
		console.clear();
		drawLogo();

		switch (curScreen) {
			default:
			case OhgScreen.Room:
				const { ROOM } = await MenuData.chooseRoom();

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
				const { DEVICE } = await MenuData.chooseDevice((<any>global).curRoom.id);

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
							await DataHandler.sendCommand((<any>global).curDev.id, 'toggle');
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
				const { RGBCMD } = await MenuData.chooseRGBMenu();

				switch (RGBCMD) {
					case '':
						curScreen = OhgScreen.Device;
						break;

					case 'pickColor':
						curScreen = OhgScreen.ColorPicker;
						break;

					default:
						//Fire and forget
						await DataHandler.sendCommand((<any>global).curDev.id, RGBCMD);
						curScreen = OhgScreen.Device
						break;
				}
				break;

			case OhgScreen.ColorPicker:
				console.log(chalk.bold.inverse((<any>global).curDev.Name))
				const { COLOR } = await MenuData.chooseColor();

				switch (COLOR) {
					case '':
						curScreen = OhgScreen.RGBMenu;
						break;

					default:
						await DataHandler.sendCommand((<any>global).curDev.id, COLOR);
						curScreen = OhgScreen.Device;
						break;
				}
				break;
		}
	}
};

mainLoop();