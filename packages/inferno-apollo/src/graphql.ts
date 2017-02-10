import { DocumentNode } from 'graphql';

import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import hoistNonInfernoStatic from 'hoist-non-inferno-statics';
import { throwError } from 'inferno-helpers';

import ApolloHelper from './apolloHelper';
import { OperationOption, QueryOptions, DocumentType } from './types';
import parser from './parser';
import getDisplayName from './utils/getDisplayName';
import shallowEqual from './utils/shallowEqual';

// Helps track hot reloading
let nextVersion: number = 0;

export default function graphql(
	document: DocumentNode,
	operationOptions: OperationOption = {}
) {
	// extract options
	const alias = 'Apollo';

	// safety check on the operation
	const operation = parser(document);

	// Helps track hot reloading.
	const version = nextVersion++;

	const wrapWithApolloClient = (WrappedComponent: any) => {
		const graphQLDisplayName = `${alias}(${getDisplayName(WrappedComponent)})`;
		const wrappedComponentDisplayName = getDisplayName(WrappedComponent);

		class GraphQL extends Component<any, any> {
			static displayName = graphQLDisplayName;
			static WrappedComponent = WrappedComponent;

			// Needed by HMR
			public props: any;
			public version: number;
			public hasMounted: boolean;

			private apolloHelper: ApolloHelper;
			private shouldRender: Boolean;
			private shouldRerender: Boolean;
			private renderedElement: any;

			constructor(props, context) {
				super(props, context);
				this.version = version;
				if (!context.client) {
					throwError(
						`Could not find "client" in the context of ` +
						`"${graphQLDisplayName}". ` +
						`Wrap the root component in an <ApolloProvider>`
					);
				}
				this.apolloHelper = new ApolloHelper({
					client: context.client,
					type: operation.type,
					document,
					displayName: graphQLDisplayName,
					operationOptions,
					operation,
					wrappedComponentDisplayName,
					forceRenderChildren: this.forceRenderChildren
				});

				if (!this.shouldSkip(props)) {
					this.setInitialProps();
				}
			}

			componentDidMount() {
				this.hasMounted = true;
				if (!this.apolloHelper.isType(DocumentType.Mutation)
					&& !this.shouldSkip(this.props)) {
					this.apolloHelper.subscribeToQuery();
				}
			}

			componentWillReceiveProps(nextProps) {
				if (shallowEqual(this.props, nextProps)) {
					return;
				}

				this.shouldRender = true;

				if (this.apolloHelper.isType(DocumentType.Mutation)) {
					return;
				}

				if (this.apolloHelper.isType(DocumentType.Subscription)
					&& operationOptions.shouldResubscribe
					&& operationOptions.shouldResubscribe(this.props, nextProps)) {
						this.apolloHelper.unsubscribeFromQuery();
						this.apolloHelper.deleteQueryObservable();
						this.apolloHelper.updateQuery(nextProps);
						this.apolloHelper.subscribeToQuery();
						return;
				}

				if (this.shouldSkip(nextProps)) {
					if (!this.shouldSkip(this.props)) {
						this.apolloHelper.unsubscribeFromQuery();
					}

					return;
				}

				this.apolloHelper.updateQuery(nextProps);
				this.apolloHelper.subscribeToQuery();
			}

			componentWillUnmount() {
				if (this.apolloHelper.isType(DocumentType.Mutation)
					|| this.apolloHelper.isType(DocumentType.Subscription)) {
					this.apolloHelper.unsubscribeFromQuery();
				}

				this.hasMounted = false;
			}

			shouldSkip(props: any = this.props) {
				return this.apolloHelper.mapPropsToSkip(props) ||
					(this.apolloHelper.mapPropsToOptions(props) as QueryOptions).skip;
			}

			setInitialProps() {
				if (this.apolloHelper.isType(DocumentType.Mutation)) {
					return;
				}

				const opts = this.apolloHelper.calculateOptions(this.props);
				this.apolloHelper.createQuery(opts);
			}

			forceRenderChildren = () => {
				this.shouldRerender = true;
				if (this.hasMounted) {
					this.setState({});
				}
			}

			render() {
				if (this.shouldSkip()) {
					return createElement(WrappedComponent, this.props);
				}

				const { shouldRerender, renderedElement, props } = this;
				this.shouldRerender = false;

				const data = this.apolloHelper.getDataForChild(props);
				const clientProps = this.apolloHelper.calculateResultProps(data, props);
				const mergedPropsAndData = Object.assign({}, props, clientProps);

				if (!shouldRerender && renderedElement) {
					return renderedElement;
				}

				if (operationOptions.withRef) {
					mergedPropsAndData.ref = 'wrappedInstance';
				}

				this.renderedElement = createElement(WrappedComponent, mergedPropsAndData);

				return this.renderedElement;
			}
		}

		return hoistNonInfernoStatic(GraphQL, WrappedComponent, {});
	};

	return wrapWithApolloClient;
}
