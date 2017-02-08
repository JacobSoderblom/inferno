import pick from 'lodash/pick';

export default function observableQueryFields(observable) {
	const fields = pick(observable, 'variables',
		'refetch', 'fetchMore', 'updateQuery', 'startPolling', 'stopPolling', 'subscribeToMore');

	Object.keys(fields).forEach((key) => {
		if (typeof fields[key] === 'function') {
			fields[key] = fields[key].bind(observable);
		}
	});

	return fields;
}
