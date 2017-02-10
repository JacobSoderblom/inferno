import parser from './parser.spec';
import utils from './utils/index.spec';
import apolloProvider from './client/ApolloProvider.spec';
import withApollo from './client/withApollo.spec';
import graphql from './client/graphql/index.spec';

describe('Apollo', () => {
	utils();
	parser();
	apolloProvider();
	withApollo();
	graphql();
});
