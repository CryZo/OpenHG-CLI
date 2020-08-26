import inquirer from "inquirer";
import chalk from "chalk";

import { DeviceType } from "./enums/DeviceType";

export class MenuData {
	static chooseRoom () {
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

	static chooseDevice (id: string) {
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

	static chooseRGBMenu () {
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

	static chooseColor () {
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
}