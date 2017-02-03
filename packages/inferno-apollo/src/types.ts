import { MutationQueryReducersMap } from 'apollo-client';

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
}

export declare interface MutationOptions {
	variables?: Object;
	optimisticResponse?: Object;
	updateQueries?: MutationQueryReducersMap;
	forceFetch?: boolean;
}
