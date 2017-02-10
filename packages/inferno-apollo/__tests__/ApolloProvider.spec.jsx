import { expect } from 'chai';
import { render as _render } from 'inferno';
import Component from 'inferno-component';
import { createStore } from 'redux';
import { innerHTML } from 'inferno/test/utils';
import ApolloClient from 'apollo-client';

import ApolloProvider from '../dist-es/ApolloProvider';

export default function () {
	describe('ApolloProvider', () => {
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

		const client = new ApolloClient();
		const store = createStore(() => ({}));

		describe('Children', () => {

			it('should render child', () => {
				render(
					<ApolloProvider store={store} client={client}>
						<div className="child" />
					</ApolloProvider>
				);

				expect(container.innerHTML).to.equal(innerHTML('<div class="child"></div>'));
			});

			it('should render one child without any errors', () => {
				expect(() => render(
					<ApolloProvider store={store} client={client}>
						<div />
					</ApolloProvider>
				)).to.not.throw(Error);
			});

			it('should render no child with errors', () => {
				expect(() => render(
					<ApolloProvider store={store} client={client}>
					</ApolloProvider>
				)).to.throw(Error);
			});

			it('should render more than one child with errors', () => {
				expect(() => render(
					<ApolloProvider store={store} client={client}>
						<div />
						<div />
					</ApolloProvider>
				)).to.throw(Error);
			});
		});

		describe('Client', () => {
			it('should require an instance of ApolloClient', () => {
				expect(() => render(
					<ApolloProvider>
						<div />
					</ApolloProvider>
				)).to.throw(Error);
			});
		});

		describe('Store', () => {
			it('should not require a store', () => {
				expect(() => render(
					<ApolloProvider client={client}>
						<div />
					</ApolloProvider>
				)).to.not.throw(Error);
			});
		});
	});
}
