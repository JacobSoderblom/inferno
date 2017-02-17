import gql from 'graphql-tag';
import { expect } from 'chai';
import ApolloClient, { ApolloError } from 'apollo-client';

import { render } from 'inferno';
import Component from 'inferno-component';

import { ApolloProvider, graphql } from '../../../dist-es';
import MockNetworkInterface from '../../../mock/networkInterface';

export default function () {
	describe('Mutations', () => {

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

		it('should bind mutation to props', done => {
			const query = gql`mutation addPerson { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			const Container = graphql(query)(({ mutate }) => {
				expect(mutate).to.not.be.null;
				expect(typeof mutate).to.equal('function');
				done();
				return null;
			});

			renderer(Container);
		});

		it('should bind mutation to custom prop', done => {
			const query = gql`mutation addPerson { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			const props = ({ ownProps, addPerson }) => ({
				[ownProps.methodName]: name => addPerson({ variables: { name } }),
			});

			const Container = graphql(query, { props })(({ test }) => {
				expect(test).to.not.be.null;
				expect(typeof test).to.equal('function');
				done();
				return null;
			});

			renderer(Container, { methodName: 'test' });
		});

		it('should not swallow childrens errors', () => {
			const query = gql`mutation addPerson { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			const Container = graphql(query)(({ mutation }) => {
				foo();
				expect(mutation).to.not.be.null;
				expect(typeof mutation).to.equal('function');
				return null;
			});

			expect(() => renderer(Container)).to.throw(Error);
		});

		it('should execute mutation', done => {
			const query = gql`mutation addPerson { allPeople(first: 1) { people { name } } }`;
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentDidMount() {
					const { mutate } = this.props;
					mutate().then(result => {
						expect(result.data).to.eql(data);
						done();
					});
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData);
		});

		it('should execute mutation with variables from props', done => {
			const query = gql`
				mutation addPerson($id: Int) {
					allPeople(id: $id) { people { name } }
				}
    	`;
			const variables = { id: 1 };
			const networkInterface = new MockNetworkInterface({ request: { query, variables }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentDidMount() {
					const { mutate } = this.props;
					mutate().then(result => {
						expect(result.data).to.eql(data);
						done();
					});
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData, variables);
		});

		it('should execute mutation with custom variables', done => {
			const query = gql`
				mutation addPerson($id: Int) {
					allPeople(id: $id) { people { name } }
				}
    	`;
			const variables = { id: 1 };
			const networkInterface = new MockNetworkInterface({ request: { query, variables }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentDidMount() {
					const { mutate } = this.props;
					mutate({ variables }).then(result => {
						expect(result.data).to.eql(data);
						done();
					});
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData);
		});

		it('should allows falsy values in the mapped variables from props', done => {
			const query = gql`
				mutation addPerson($id: Int) {
					allPeople(id: $id) { people { name } }
				}
    	`;
			const variables = { id: null };
			const networkInterface = new MockNetworkInterface({ request: { query, variables }, result: { data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentDidMount() {
					const { mutate } = this.props;
					mutate().then(result => {
						expect(result.data).to.eql(data);
						done();
					});
				}

				render() {
					return null;
				}
			}

			const ChildWithData = graphql(query)(Child);

			renderer(ChildWithData, variables);
		});

		it('should execute mutation with optimisticResponse', done => {
			const query = gql`mutation addPerson { people { name __typename } __typename }`;
			const _data = {
				__typename: 'Mutation',
				people: {
					__typename: 'People',
					name: 'Luke'
				}
			};
			const networkInterface = new MockNetworkInterface({ request: { query }, result: { data: _data } });
			const client = new ApolloClient({ networkInterface, addTypename: false });
			const renderer = createRenderer(client);

			class Child extends Component {

				componentDidMount() {
					const { mutate } = this.props;
					const optimisticResponse = {
						__typename: 'Mutation',
						people: {
							__typename: 'People',
							name: 'Optimistic'
						}
					};
					const promise = mutate({ optimisticResponse });

					const dataInStore = client.queryManager.getDataWithOptimisticResults();
					expect(dataInStore['$ROOT_MUTATION.people']).to.eql(
						optimisticResponse.people
					);

					promise.then(result => {
						expect(result.data).to.eql(_data);
						done();
					});
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
