import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import hoistNonInfernoStatic from 'hoist-non-inferno-statics';
import { throwError } from 'inferno-helpers';

import { OperationOption } from './types';
import getDisplayName from './utils/getDisplayName';

export default function withApollo(
	WrappedComponent,
	operationOptions: OperationOption = {}
) {
	const displayName = `withApollo(${getDisplayName(WrappedComponent)})`;

	class WithApollo extends Component<any, any> {
		static displayName = displayName;
		static WrappedComponent = WrappedComponent;

		public props: any;
		private client: any;

		constructor(props, context) {
			super(props, context);
			this.client = context.client;

			if (!this.client) {
				throwError(
					`Could not find "client" in the context of ` +
					`"${displayName}". ` +
					`Wrap the root component in an <ApolloProvider>`
				);
			}
		}

		getWrappedInstance() {
			if (!operationOptions.withRef) {
				throwError(
					`To access the wrapped instance, you need to specify ` +
					`{ withRef: true } in the options`
				);
			}

			return (this.refs as any).wrappedInstance;
		}

		render() {
			const props = Object.assign({}, this.props, {
				client: this.client
			});

			if (operationOptions.withRef) {
				props.ref = 'wrappedInstance';
			}

			return createElement(WrappedComponent, props);
		}
	}

	return hoistNonInfernoStatic(WithApollo, WrappedComponent);
};
