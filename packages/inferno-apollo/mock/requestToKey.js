import { print } from 'graphql-tag/printer';

import { isObject } from 'inferno-helpers';

export default function requestToKey(request) {
	const queryString = request.query && print(request.query);
	const parsedRequest = {
		variables: request.variables,
		debugName: request.debugName,
		query: queryString,
	};
	if (isObject(parsedRequest.variables) && Object.keys(parsedRequest.variables).length === 0) {
		delete parsedRequest.variables;
	}
	return JSON.stringify(parsedRequest);
}
