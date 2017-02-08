import { expect } from 'chai';
import gql from 'graphql-tag';

import parser from '../dist-es/utils/parser';

describe('Apollo parser()', () => {

	it('should throw error when not using graphql-tag', () => {
		const query = 'query { user { name } }';

		expect(() => parser(query)).to.throw(Error);
	});

	it('should throw error when both query and mutation is present', () => {
		const query = gql`
			query { user { name } }
      mutation ($t: String) { addT(t: $t) { user { name } } }
		`;

		expect(() => parser(query)).to.throw(Error);
	});

	it('should throw error when multiple queries is present', () => {
		const query = gql`
			query user { user { name } }
      query user2 { user { name } }
		`;

		expect(() => parser(query)).to.throw(Error);
	});
});
