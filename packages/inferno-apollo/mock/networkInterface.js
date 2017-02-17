import { print } from 'graphql-tag/printer';
import requestToKey from './requestToKey';

export default class MockNetworkInterface {
	mockedResponsesByKey = {};

	constructor(...mockedResponses) {
		mockedResponses.forEach(this.addMockedReponse.bind(this));
	}

	addMockedReponse(mockedResponse) {
		const key = requestToKey(mockedResponse.request);
		let mockedResponses = this.mockedResponsesByKey[key];
		if (!mockedResponses) {
			mockedResponses = [];
			this.mockedResponsesByKey[key] = mockedResponses;
		}
		mockedResponses.push(mockedResponse);
	}

	query(request) {
		return new Promise((resolve, reject) => {
			const key = requestToKey(request);

			if (!this.mockedResponsesByKey[key]) {
				console.log(key);
				console.log(request);
				throw new Error('No more mocked responses for the query: ' + print(request.query));
			}

			const original = [...this.mockedResponsesByKey[key]];
			const { result, error, delay, newData } = this.mockedResponsesByKey[key].shift() || {};

			if (newData) {
				original[0].result = newData();
				this.mockedResponsesByKey[key].push(original[0]);
			}

			if (!result && !error) {
				throw new Error(`Mocked response should contain either result or error: ${key}`);
			}

			setTimeout(() => {
				if (error) {
					return reject(error);
				}
				return resolve(result);
			}, delay ? delay : 1);
		});
	}
}
