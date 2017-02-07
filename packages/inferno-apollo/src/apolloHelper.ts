import ApolloClient, { Subscription, ObservableQuery } from 'apollo-client';
import { DocumentNode } from 'graphql';

import { throwError } from 'inferno-helpers';

import { DocumentType, QueryOptions, OperationOption, MutationOptions, IDocumentDefinition } from './types';
import observableQueryFields from './utils/observableQueryFields';

export interface ApolloHelperOptions {
	client: ApolloClient;
	type: DocumentType;
	document: DocumentNode;
	operationOptions: OperationOption;
	displayName: string;
	operation: IDocumentDefinition;
	wrappedComponentDisplayName: string;
	forceRenderChildren: Function;
}

export default class ApolloHelper {

	private client: ApolloClient;
	private type: DocumentType;
	private document: DocumentNode;
	private displayName: string;
	private operationOption: OperationOption;
	private operation: IDocumentDefinition;
	private wrappedComponentDisplayName: string;
	private forceRenderChildren: Function;

	// request / action storage. Note that we delete querySubscription if we
	// unsubscribe but never delete queryObservable once it is created.
	private queryObservable: ObservableQuery<any> | any;
	private querySubscription: Subscription;
	private lastSubscriptionData: any;
	private previousData: any;

	constructor(options: ApolloHelperOptions) {
		this.client = options.client;
		this.type = options.type;
		this.document = options.document;
		this.displayName = options.displayName;
		this.operationOption = options.operationOptions;
		this.operation = options.operation;
		this.wrappedComponentDisplayName = options.wrappedComponentDisplayName;
		this.forceRenderChildren = options.forceRenderChildren;
	}

	public isType(type: DocumentType): Boolean {
		return this.type === type;
	}

	public subscribeToQuery(): void {
		if (!this.querySubscription) {
			this.querySubscription = this.queryObservable
				.subscribe({ next: this.next, error: this.handleError });
		}
	}

	public unsubscribeFromQuery(): void {
		if (this.querySubscription) {
			(this.querySubscription as Subscription).unsubscribe();
			delete this.querySubscription;
		}
	}

	public updateQuery(props: any): void {
		const opts = this.calculateOptions(props) as QueryOptions;

		if (!this.queryObservable) {
			this.createQuery(opts);
		}

		if (this.queryObservable._setOptionsNoResult) {
			this.queryObservable._setOptionsNoResult(opts);
		} else if (this.queryObservable.setOptions) {
			this.queryObservable.setOptions(opts)
				.catch((err: any) => undefined);
		}
	}

	public createQuery(opts: QueryOptions) {
		if (this.isType(DocumentType.Subscription)) {
			this.queryObservable = this.client.subscribe(Object.assign({}, opts, {
				query: this.document
			}));
		} else {
			this.queryObservable = this.client.watchQuery(Object.assign({}, opts, {
				query: this.document,
				metadata: {
					infernoComponent: {
						displayName: this.displayName
					}
				}
			}));
		}
	}

	public deleteQueryObservable(): void {
		delete this.queryObservable;
	}

	public calculateOptions(props: any, newOpts?: any): QueryOptions {
		let opts = this.mapPropsToOptions(props);

		if (newOpts) {
			const newOptsVariables = newOpts.variables || {};
			opts = Object.assign({}, opts, {
				...newOpts,
				variables: {
					...newOptsVariables
				}
			});
		}

		if (!opts.variables || this.operation.variables.length) {
			let variables = {};
			const keys: string[] = Object.keys(this.operation.variables);
			for (let i = 0; i < keys.length; i++) {
				const { variable, type } = this.operation.variables[keys[i]];
				if (!variable.name || !variable.name.value) {
					continue;
				}

				if (typeof props[variable.name.value] !== 'undefined') {
					variables[variable.name.value] = props[variable.name.value];
					continue;
				}

				if (type.kind !== 'NonNullType') {
					variables[variable.name.value] = null;
					continue;
				}

				if (typeof props[variable.name.value] === 'undefined') {
					throwError(
						`The operation '${this.operation.name}' wrapping '${this.wrappedComponentDisplayName}' ` +
						`is expecting a variable: '${variable.name.value}' but it was not found in the props ` +
						`passed to '${this.displayName}'`
					);
				}
			}
			opts.variables = variables;
		}

		return opts;
	}

	public calculateResultProps(result: any, props: any): any {
		let name: string = 'data';
		if (this.operationOption.name) {
			name = this.operationOption.name;
		} else if (this.isType(DocumentType.Mutation)) {
			name = 'mutation';
		}

		const newResult = { [name]: result, ownProps: props };
		if (this.operationOption.props) {
			return this.operationOption.props(newResult);
		}

		return { [name]: this.defaultMapResultToProps(result) };
	}

	public getDataForChild(props: any): any {
		if (this.isType(DocumentType.Mutation)) {
			return this.dataForChildAsMutation(props);
		}

		const opts = this.calculateOptions(props);
		let data = Object.assign({}, observableQueryFields(this.queryObservable));

		if (this.isType(DocumentType.Subscription)) {
			data = Object.assign({}, data, {
				loading: !this.lastSubscriptionData,
				variables: opts.variables
			}, this.lastSubscriptionData);
		} else {
			const currentResult = this.queryObservable.currentResult();
			const { loading, error, networkStatus } = currentResult;

			data = Object.assign({}, data, {
				loading,
				error,
				networkStatus
			});

			if (loading) {
				data = Object.assign({}, data, this.previousData, currentResult.data);
			} else {
				data = Object.assign({}, data, currentResult.data);
				this.previousData = currentResult.data;
			}
		}
		return data;
	}

	public mapPropsToOptions(props: any): QueryOptions | MutationOptions {
		let propsToOptions = this.operationOption.options as (props: any) => QueryOptions | MutationOptions;
		if (typeof propsToOptions !== 'function') {
			propsToOptions = () => this.operationOption.options;
		}
		return propsToOptions(props);
	}

	public mapPropsToSkip(props: any): Boolean | any {
		let propsToSkip = this.operationOption.skip as (props: any) => Boolean;
		if (typeof propsToSkip !== 'function') {
			propsToSkip = (() => this.operationOption.skip as any);
		}
		return propsToSkip(props);
	}

	private defaultMapResultToProps = (props) => props;

	private dataForChildAsMutation = (props: any) => (mutationOpts: MutationOptions) => {
		const opts = this.calculateOptions(props, mutationOpts);

		if (typeof opts.variables === 'undefined') {
			delete opts.variables;
		}

		(opts as any).mutation = this.document;
		return this.client.mutate((opts as any));
	}

	private next(results: any) {
		if (this.isType(DocumentType.Subscription)) {
			this.lastSubscriptionData = results;
			results = { data: results };
		}

		const clashingKeys = Object.keys(observableQueryFields(results.data));
		if (clashingKeys.length) {
			throwError(
				`the result of the '${this.displayName}' operation contains keys that ` +
				`conflict with the return object.` +
				clashingKeys.map((k: string) => `'${k}'`).join(', ') + ` not allowed.`
			);
		}
		this.forceRenderChildren();
	}

	private handleError(error: Error): any {
		if (error.hasOwnProperty('graphQLErrors')) {
			return this.next({ error });
		}

		throw error;
	}
}
