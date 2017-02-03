import Component from 'inferno-component';
import ApolloClient from 'apollo-client';
import { Store } from 'redux';
import { throwError, isNullOrUndef, toArray } from 'inferno-helpers';

export declare interface ProviderProps {
	store?: Store<any>;
	immutable?: boolean;
	client: ApolloClient;
	children: any;
}

export default class ApolloProvider extends Component<ProviderProps, any> {
	store: Store<any>;
	client: ApolloClient;

	constructor(props, context) {
		super(props, context);
		if (!props.client) {
			throwError(
				'ApolloClient was not passed a client instance. Make ' +
				'sure you pass in your client via the "client" prop.'
			);
		}

		this.client = props.client;

		if (props.store) {
			this.store = props.store;
			// support an immutable store alongside apollo store
			if (props.immutable) {
				props.client.initStore();
			}
		} else {
			// intialize the built in store if none is passed in
			props.client.initStore();
			this.store = props.client.store;
		}
	}

	getChildContext() {
		return {
			store: this.store,
			client: this.client
		};
	}

	render() {
		if (isNullOrUndef(this.props.children) || toArray(this.props.children).length !== 1) {
			throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
		}

		return this.props.children;
	}
}
