import { NetworkInterface } from 'apollo-client/transport/networkInterface';

export class MockNetworkInterface extends NetworkInterface {
	mockedResponsesByKey = {};

	constructor(...mockedResponses) {
		super();
		mockedResponses.forEach((mockedResponse) => {
			this.addMockedReponse(mockedResponse);
		});
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
			const parsedRequest = {
				query: request.query,
				variables: request.variables,
				debugName: request.debugName,
			};

			const key = requestToKey(parsedRequest);

			if (!this.mockedResponsesByKey[key]) {
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
				if (error) return reject(error);
				return resolve(result);
			}, delay ? delay : 1);
		});
	}
}
