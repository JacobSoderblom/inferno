import gql from 'graphql-tag';
import { expect } from 'chai';
import ApolloClient, { ApolloError } from 'apollo-client';

import { render } from 'inferno';
import Component from 'inferno-component';

import { ApolloProvider, graphql } from '../../../dist-es';
import MockNetworkInterface from '../../../mock/networkInterface';

export default function () {
	describe('Queries', () => {

		let container;
		const createRenderer = client => (Component, props = {}) => {
			const Provider = (<ApolloProvider client={client}><Component {...props} /></ApolloProvider>);
			render(Provider, container);
		};
		const data = {
			allPeople: {
				people: [{
					name: 'Luke Skywalker'
				}]
			}
		};

		beforeEach(() => {
			container = document.createElement('div');
			container.style.display = 'none';
			document.body.appendChild(container);
		});

		afterEach(() => {
			document.body.removeChild(container);
			render(null);
		});

		it('should bind query to props', done => {
			const query = gql`query people { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentWillMount() {
					const { data } = this.props;
					expect(data).to.not.be.null;
					expect(data.ownProps).to.equal(undefined);
					expect(data.loading).to.equal(true);
					done();
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData);
		});

		it('should not warn about fragments', () => {
			const oldWarn = console.warn;
			const warnings = [];
			console.warn = (str) => warnings.push(str);

			try {
				graphql(gql`query foo { bar }`);
				expect(warnings.length).to.equal(0);
			} finally {
				console.warn = oldWarn;
			}
		});

		it('should include variables in the props', done => {
			const query = gql`query people ($first: Int) { allPeople(first: $first) { people { name } } }`;
			const variables = { first: 1 };
			const networkInterface = new MockNetworkInterface({ request: { query, variables }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentWillMount() {
					const { data } = this.props;
					expect(data).to.not.be.null;
					expect(data.variables).to.eql(variables);
					done();
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData, variables);
		});

		it('should not swallow childrens errors', () => {
			const query = gql`query people { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			const Container = graphql(query)(() => {
				foo();
				return null;
			});

			expect(() => renderer(Container)).to.throw(Error);
		});

		it('should execute query', done => {
			const query = gql`query people { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentWillReceiveProps(props) {
					expect(props.data.loading).to.equal(false);
					expect(props.data.allPeople).to.eql(data.allPeople);
					done();
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData);
		});

		it('should execute query with two root fields', done => {
			const query = gql`query people {
				allPeople(first: 1) { people { name } }
				otherPeople(first: 1) { people { name } }
			}`;
			data.otherPeople = data.allPeople;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentWillReceiveProps(props) {
					expect(props.data.loading).to.equal(false);
					expect(props.data.allPeople).to.eql(data.allPeople);
					expect(props.data.otherPeople).to.eql(data.otherPeople);
					done();
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData);
		});

		it('should pass erros from GraphQL in props', done => {
			const query = gql`query people { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, error: new Error('foo') });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentWillReceiveProps(props) {
					expect(props.data.error).to.not.be.null;
					expect(props.data.error.networkError).to.not.be.null;
					done();
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData);
		});
	});
}
