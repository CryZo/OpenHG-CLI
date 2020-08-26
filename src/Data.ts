import fetch from 'node-fetch';

export class Data {
	url: string;

	constructor (url: string) {
		this.url = url;
		setInterval(this.fetchData, 5000);
	}

	async fetchData() {
		try {
			let response = await fetch(`${this.url}/full`);
			(<any>global).data = await response.json();
		}
		catch(err) {}
	}

	async sendCommand(id: string, command: string) {
		try {
			await fetch(`${this.url}/controll/${id}/${command}`);

			//Update data model
			await this.fetchData();
		}
		catch(err) { }
	}
}