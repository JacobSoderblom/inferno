import parser from './parser.spec';
import utils from './utils/index.spec';
import apolloProvider from './ApolloProvider.spec';

describe('Apollo', () => {
	utils();
	parser();
	apolloProvider();
});
