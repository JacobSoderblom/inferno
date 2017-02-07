import { MutationQueryReducersMap, ApolloError, ApolloQueryResult } from 'apollo-client';
import { FetchMoreQueryOptions, SubscribeToMoreOptions } from 'apollo-client/core/watchQueryOptions';
import { FetchMoreOptions, UpdateQueryOptions } from 'apollo-client/core/ObservableQuery';
import { VariableDefinitionNode } from 'graphql';

export interface GraphQLDataProps {
	error?: ApolloError;
	networkStatus: number;
	loading: boolean;
	variables: {
		[variable: string]: any;
	};
	fetchMore: (fetchMoreOptions: FetchMoreQueryOptions & FetchMoreOptions) => Promise<ApolloQueryResult<any>>;
	refetch: (variables?: any) => Promise<ApolloQueryResult<any>>;
	startPolling: (pollInterval: number) => void;
	stopPolling: () => void;
	subscribeToMore: (options: SubscribeToMoreOptions) => () => void;
	updateQuery: (mapFn: (previousQueryResult: any, options: UpdateQueryOptions) => any) => void;
}

export interface InjectedGraphQLProps<T> {
	data?: T & GraphQLDataProps;
}

export interface OperationOption {
	options?: Object | ((props: any) => QueryOptions | MutationOptions);
	props?: (props: any) => any;
	skip?: boolean | ((props: any) => boolean);
	name?: string;
	withRef?: boolean;
	shouldResubscribe?: (props: any, nextProps: any) => boolean;
	alias?: string;
}

export declare interface QueryOptions {
	ssr?: boolean;
	variables?: { [key: string]: any };
	forceFetch?: boolean;
	returnPartialData?: boolean;
	noFetch?: boolean;
	pollInterval?: number;
	skip?: boolean;
}

export declare interface MutationOptions {
	variables?: Object;
	optimisticResponse?: Object;
	updateQueries?: MutationQueryReducersMap;
	forceFetch?: boolean;
}

export interface IDocumentDefinition {
	type: DocumentType;
	name: string;
	variables: VariableDefinitionNode[];
}

export enum DocumentType {
	Query,
	Mutation,
	Subscription
}
