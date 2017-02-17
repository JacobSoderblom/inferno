import fragments from './fragments.spec';
import queries from './queries.spec';
import mutations from './mutations.spec';

export default function () {
	describe('GraphQL', () => {
		fragments();
		queries();
		mutations();
	});
}
