import gql from 'graphql-tag';

import parser from '../dist-es/utils/parser';

describe('Apollo parser()', () => {

	it('should throw error when both query and mutation is present', () => {
		const query = gql`
			query { user { name } }
      mutation ($t: String) { addT(t: $t) { user { name } } }
		`;

		try {
			parser(query);
		} catch (err) {
			expect(err).toMatch(/Invariant Violation/);
		}
	});
});
