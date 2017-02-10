import {
	DocumentNode,
	DefinitionNode,
	VariableDefinitionNode,
	OperationDefinitionNode
} from 'graphql';

import { throwError } from 'inferno-helpers';

import SwitchCase from './utils/switchCase';
import { DocumentType, IDocumentDefinition } from './types';

interface IDefinitionNodes {
	queries: DefinitionNode[];
	mutations: DefinitionNode[];
	subscriptions: DefinitionNode[];
}

export default function parser(document: DocumentNode): IDocumentDefinition {
	let variables: VariableDefinitionNode[];
	let name: string;
	let type: DocumentType;

	/**
	 * Saftey check
	 */
	if (!document || !document.kind) {
		throwError(`Argument of ${document} passed to parser was not a valid GraphQL DocumentNode. You may need to use 'graphql-tag' or another method to convert your operation into a document`);
	}

	const {
		queries,
		mutations,
		subscriptions
	} = document.definitions.reduce((definitions: IDefinitionNodes, def: DefinitionNode) => {
		if (def.kind === 'OperationDefinition') {
			const resolveOperation = SwitchCase({
				query: () => definitions.queries.push(def),
				mutation: () => definitions.mutations.push(def),
				subscription: () => definitions.subscriptions.push(def)
			});
			resolveOperation(null)(def.operation);
		}

		return definitions;
	}, {
		queries: [],
		mutations: [],
		subscriptions: []
	});

	if ((queries.length && mutations.length)
		|| (queries.length && subscriptions.length)
		|| (mutations.length && subscriptions.length)) {
		throwError(
			`inferno-apollo only supports a query, subscription, or a mutation per HOC. ${document} had ${queries.length} queries, ${subscriptions.length} subscriptions and ${mutations.length} muations. You can use 'compose' to join multiple operation types to a component`
		);
	}

	let definitions;
	if (queries.length) {
		type = DocumentType.Query;
		definitions = queries;
	} else if (mutations.length) {
		type = DocumentType.Mutation;
		definitions = mutations;
	} else {
		type = DocumentType.Subscription;
		definitions = subscriptions;
	}

	if (definitions.length !== 1) {
		throwError(
			`inferno-apollo only supports one defintion per HOC. ${document} had ${definitions.length} definitions. You can use 'compose' to join multiple operation types to a component`
		);
	}

	const definition = definitions[0] as OperationDefinitionNode;
	variables = definition.variableDefinitions || [];
	let hasName = definition.name && definition.name.kind === 'Name';
	name = hasName ? definition.name.value : 'data'; // fallback to using data if no name

	return {
		variables,
		name,
		type
	};
}
