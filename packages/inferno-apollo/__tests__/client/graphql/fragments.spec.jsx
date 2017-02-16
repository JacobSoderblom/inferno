import { expect } from 'chai';
import { render as _render } from 'inferno';
import Component from 'inferno-component';
import gql from 'graphql-tag';
import ApolloClient, { createFragment } from 'apollo-client';

import MockNetworkInterface from '../../../mock/networkInterface';

import { ApolloProvider, graphql } from '../../../dist-es';


export default function () {
	describe('Fragments', () => {

		let container;
		const render = component => _render(component, container);

		beforeEach(() => {
			container = document.createElement('div');
			container.style.display = 'none';
			document.body.appendChild(container);
		});

		afterEach(() => {
			document.body.removeChild(container);
			render(null);
		});

		it('should throw error if only a fragment is passed', () => {
			const query = gql`
      	fragment Failure on PeopleConnection { people { name } }
			`;
			const data = {
				allPeople: {
					people: [{
						name: 'Chewbacca'
					}]
				}
			};

			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });

			class Child extends Component {

				render() {
					return (
						<div />
					);
				}
			}

			expect(() => graphql(query)(Child)).to.throw(Error);
		});

		it('should correctly fetches a query with inline fragments', done => {
			const query = gql`
				query people { allPeople(first: 1) { __typename ...person } }
				fragment person on PeopleConnection { people { name } }
			`;
			const data = {
				allPeople: {
					__typename: 'PeopleConnection',
					people: [{
						name: 'Luke Skywalker'
					}]
				}
			};
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const provider = Component => (<ApolloProvider client={client}>{Component}</ApolloProvider>);

			class Child extends Component {

				componentWillReceiveProps(props) {
					expect(props.data.loading).to.equal(false);
					expect(props.data.allPeople.__typename).to.equal(data.allPeople.__typename);
					done();
				}

				render() {
					return (
						<div />
					);
				}
			}

			const WithData = graphql(query)(Child);

			render(provider(<WithData />));
		});
	});
}
