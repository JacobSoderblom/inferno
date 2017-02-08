import { expect } from 'chai';
import gql from 'graphql-tag';

import SwitchCase from '../../dist-es/utils/switchCase';

export default function () {
	describe('SwitchCase', () => {
		it('should deliver simple value', () => {
			const type = 'query';
			const testSwitch = new SwitchCase({
				query: 'query',
				mutation: 'mutation',
				subscription: 'subscription'
			})(null);

			expect(testSwitch(type)).to.be.equal('query');
		});

		it('should exec function to return value', () => {
			const type = 'query';
			const testSwitch = new SwitchCase({
				query: () => 'query',
				mutation: () => 'mutation',
				subscription: () => 'subscription'
			})(null);

			expect(testSwitch(type)).to.be.equal('query');
		});

		it('should exec function to push to array', () => {
			const type = 'query';
			const results = [];
			const testSwitch = new SwitchCase({
				query: () => results.push('query'),
				mutation: () => results.push('mutation'),
				subscription: () => results.push('subscription')
			})(null);

			testSwitch(type);

			expect(results[0]).to.be.equal('query');
		});

		it('should work with graphql-tag', () => {
			const query = gql`
				query { user { name } }
				mutation ($t: String) { addT(t: $t) { user { name } } }
			`;

			const { queries, mutations } = query.definitions.reduce((definitions, def) => {
				if (def.kind === 'FragmentDefinition') {
					definitions.fragments.push(def);
				} else if (def.kind === 'OperationDefinition') {
					const resolveOperation = new SwitchCase({
						query: () => definitions.queries.push(def),
						mutation: () => definitions.mutations.push(def),
						subscription: () => definitions.subscriptions.push(def)
					});
					resolveOperation(null)(def.operation);
				}

				return definitions;
			}, {
				fragments: [],
				queries: [],
				mutations: [],
				subscriptions: []
			});

			expect(queries.length).to.equal(1);
			expect(mutations.length).to.equal(1);
		});
	});
}
