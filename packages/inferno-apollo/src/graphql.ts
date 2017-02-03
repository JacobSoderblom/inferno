import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import hoistNonInfernoStatic from 'hoist-non-inferno-statics';
import {
	DocumentNode
} from 'graphql';

import { OperationOption, QueryOptions, MutationOptions } from './types';
// import parser from './utils/parser';
import getDisplayName from './utils/getDisplayName';

// Helps track hot reloading
// let nextVersion: number = 0;

export default function graphql(
	document: DocumentNode,
	operationOptions: OperationOption = {}
) {
	// extract options
	const {
		options,
		skip,
		// props,
		alias = 'Apollo'
	} = operationOptions;

	let mapPropsToOptions = options as (props: any) => QueryOptions | MutationOptions;

	if (typeof mapPropsToOptions !== 'function') {
		mapPropsToOptions = () => options;
	}

	let mapPropsToSkip = skip as (props: any) => boolean;

	if (typeof mapPropsToSkip !== 'function') {
		mapPropsToSkip = (() => skip as any);
	}

	// const mapResultToProps = operationOptions.props;

	// safety check on the operation
	// const operation = parser(document);

	// Helps track hot reloading.
	// const version = nextVersion++;

	const wrapWithApolloClient = (WrappedComponent: any) => {
		const graphQLDisplayName = `${alias}(${getDisplayName(WrappedComponent)})`;

		class GraphQL extends Component<any, any> {
			static displayName = graphQLDisplayName;
			static WrappedComponent = WrappedComponent;

			render() {
				return createElement(WrappedComponent, Object.assign({}, this.props));
			}
		}

		return hoistNonInfernoStatic(GraphQL, WrappedComponent, {});
	};

	return wrapWithApolloClient;
}
