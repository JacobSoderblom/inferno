import { expect } from 'chai';
import gql from 'graphql-tag';

import parser from '../dist-es/parser';
import { DocumentType } from '../dist-es/types';

export default function () {
	describe('Parser', () => {
		describe('Error handling', () => {
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

			it('should throw error when both query and subscription is present', () => {
				const query = gql`
					query { user { name } }
					subscription { user(t: $t) { name } }
				`;

				expect(() => parser(query)).to.throw(Error);
			});

			it('should throw error when both mutation and subscription is present', () => {
				const query = gql`
					mutation ($t: String) { addT(t: $t) { user { name } } }
					subscription { user(t: $t) { name } }
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

			it('should not error if the operation with type query has no variables', () => {
				const query = gql`query { user(t: $t) { name } }`;

				let definition = query.definitions[0];

				expect(parser(query).variables).to.equal(definition.variableDefinitions);
			});

			it('should not error if the operation with type mutation has no variables', () => {
				const mutation = gql`mutation { user(t: $t) { name } }`;

				let definition = mutation.definitions[0];

				expect(parser(mutation).variables).to.equal(definition.variableDefinitions);
			});

			it('should not error if the operation with type subscription has no variables', () => {
				const subscription = gql`subscription { user(t: $t) { name } }`;

				let definition = subscription.definitions[0];

				expect(parser(subscription).variables).to.equal(definition.variableDefinitions);
			});
		});

		describe('Operation', () => {
			describe('Name', () => {
				it('should return the name of the query', () => {
					const query = gql`query One { user { name } }`;

					expect(parser(query).name).to.equal('One');
				});

				it('should return the name of the mutation', () => {
					const mutation = gql`mutation One { user { name } }`;

					expect(parser(mutation).name).to.equal('One');
				});

				it('should return the name of the subscription', () => {
					const subscription = gql`subscription One { user { name } }`;

					expect(parser(subscription).name).to.equal('One');
				});

				it('should return data as the name when no name is provided', () => {
					const query = gql`query { user { name } }`;
					const unnamedQuery = gql`{ user { name } }`;
					const mutation = gql`mutation { user { name } }`;
					const subscription = gql`subscription { user { name } }`;

					expect(parser(query).name).to.equal('data');
					expect(parser(unnamedQuery).name).to.equal('data');
					expect(parser(mutation).name).to.equal('data');
					expect(parser(subscription).name).to.equal('data');
				});
			});
			describe('Type', () => {
				it("should return 'query' as type", () => {
					const query = gql`query { user { name } }`;

					expect(parser(query).type).to.equal(DocumentType.Query);
				});

				it("should return 'mutation' as type", () => {
					const query = gql`mutation ($t: String) { addT(t: $t) { user { name } } }`;

					expect(parser(query).type).to.equal(DocumentType.Mutation);
				});

				it("should return 'subscription' as type", () => {
					const query = gql`subscription { user(t: $t) { name } }`;

					expect(parser(query).type).to.equal(DocumentType.Subscription);
				});
			});
			describe('Variables', () => {
				it('should return the variable definitions of the operation type query', () => {
					const query = gql`query ($id: String!) { user(id: $id) { name } }`;

					let definition = query.definitions[0];

					expect(parser(query).variables).to.equal(definition.variableDefinitions);
				});

				it('should return the variable definitions of the operation type mutation', () => {
					const query = gql`mutation ($t: String) { addT(t: $t) { user { name } } }`;

					let definition = query.definitions[0];

					expect(parser(query).variables).to.equal(definition.variableDefinitions);
				});

				it('should return the variable definitions of the operation type subscription', () => {
					const query = gql`subscription ($t: String!) { user(t: $t) { name } }`;

					let definition = query.definitions[0];

					expect(parser(query).variables).to.equal(definition.variableDefinitions);
				});
			});
		});
	});
}
