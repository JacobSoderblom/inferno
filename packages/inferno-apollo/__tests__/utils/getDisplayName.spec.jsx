import { expect } from 'chai';

import Component from 'inferno-component';

import getDisplayName from '../../dist-es/utils/getDisplayName';

describe('Apollo getDisplayName()', () => {
	describe('Class component', () => {
		it('should return the name of the component when no displayName specified', () => {
			class SomeComponent extends Component {
				render() {
					return (
						<h1>Some component</h1>
					);
				}
			}

			const displayName = getDisplayName(SomeComponent);

			expect(displayName).to.equal('SomeComponent');
		});

		it('should return the name of the component when displayName specified', () => {
			class SomeComponent extends Component {
				static displayName = 'ComponentSome'

				render() {
					return (
						<h1>Some component</h1>
					);
				}
			}

			const displayName = getDisplayName(SomeComponent);

			expect(displayName).to.equal('ComponentSome');
		});
	});
	describe('Stateless component', () => {
		it('should return the name of the component when no displayName specified', () => {
			const SomeComponent = () => (
				<h1>SomeComponent</h1>
			);

			const displayName = getDisplayName(SomeComponent);

			expect(displayName).to.equal('SomeComponent');
		});
	});
});
