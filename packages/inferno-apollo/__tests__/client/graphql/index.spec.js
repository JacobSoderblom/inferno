import fragments from './fragments.spec';
import queries from './queries.spec';

export default function () {
	describe('GraphQL', () => {
		fragments();
		queries();
	});
}
