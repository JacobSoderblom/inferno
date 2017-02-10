import { expect } from 'chai';
import { renderIntoDocument, findRenderedVNodeWithType } from 'inferno-test-utils';
import Component from 'inferno-component';
import ApolloClient from 'apollo-client';

import { ApolloProvider, withApollo } from '../../dist-es';

export default function () {
	describe('WithApollo', () => {

		const client = new ApolloClient();

		class Child extends Component {

			static staticVariable = 'static';

			returnValue(value) {
				return value;
			}

			render() {
				return (
					<div />
				);
			}
		}

		it('should pass client through props', () => {
			const WithApollo = withApollo(Child);

			const tree = renderIntoDocument((
				<ApolloProvider client={client}>
					<WithApollo />
				</ApolloProvider>
			));
			const vNode = findRenderedVNodeWithType(tree, Child);

			expect(vNode.props).to.not.be.null;
			expect(vNode.props.client).to.not.be.null;
			expect(vNode.props.client).to.equal(client);
		});

		it('should allow a way to access the wrapped component instance', () => {
			const WithApollo = withApollo(Child, { withRef: true });

			const tree = renderIntoDocument((
				<ApolloProvider client={client}>
					<WithApollo />
				</ApolloProvider>
			));
			const vNode = findRenderedVNodeWithType(tree, WithApollo);

			expect(() => vNode.children.returnValue('inferno')).to.throw(Error);
			expect(vNode.children.getWrappedInstance().returnValue('inferno')).to.equal('inferno');
			expect(vNode.children.refs.wrappedComponent.returnValue('inferno')).to.equal('inferno');
		});

		it('should preserve statics', () => {
			const WithApollo = withApollo(Child);

			expect(WithApollo.staticVariable).to.equal('static');
		});
	});
}
