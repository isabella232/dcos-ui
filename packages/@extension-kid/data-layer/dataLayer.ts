import { graphqlObservable } from "@dcos/data-service";
import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable, BehaviorSubject } from "rxjs";
import { switchMap } from "rxjs/operators";
import { injectable, inject, named } from "inversify";
import { ExtensionProvider } from "@extension-kid/core";
import { GraphQLSchema } from "graphql";

export const DataLayerExtensionType = Symbol("DataLayerExtension");
export const DataLayerType = Symbol("DataLayer");
export interface DataLayerExtensionInterface {
  id: symbol;
  getTypeDefinitions(enabledSchemas: symbol[]): string;
  getResolvers(enabledSchemas: symbol[]): IResolvers;
}

const baseQuery = `
type Query {
  isPresent: Boolean
}

type Mutation {
  noOpMutation(input: String): Boolean
}

interface MutationResponse {
  code: Int!
  success: Boolean!
  message: String!
}

type BaseMutationResponse implements MutationResponse {
  code: Int!
  success: Boolean!
  message: String!
}
`;

const baseResolver = {
  Query: {
    isPresent() {
      return true;
    },
  },
  Mutation: {
    noOpMutation() {
      return true;
    },
  },
};

@injectable()
export default class DataLayer {
  public extensionType = DataLayerExtensionType;

  public _extensionProvider: ExtensionProvider<DataLayerExtensionInterface>;
  public _schema$: BehaviorSubject<GraphQLSchema>;

  constructor(
    @inject(ExtensionProvider)
    @named(DataLayerExtensionType)
    extensionProvider: ExtensionProvider<DataLayerExtensionInterface>
  ) {
    this._extensionProvider = extensionProvider;
    this._schema$ = new BehaviorSubject(this.getExecutableSchema());

    this._extensionProvider.subscribe({
      next: () => this._schema$.next(this.getExecutableSchema()),
    });
  }

  public getExecutableSchema(): GraphQLSchema {
    const extensions = this._extensionProvider.getAllExtensions();
    const enabledIds = extensions.map((extension) => extension.id);
    const typeDefs = [
      baseQuery,
      ...extensions.map((extension) =>
        extension.getTypeDefinitions(enabledIds)
      ),
    ];

    const resolvers = [
      baseResolver,
      ...extensions.map((extension) => extension.getResolvers(enabledIds)),
    ];

    return makeExecutableSchema({ typeDefs, resolvers });
  }

  public query(doc: any, context?: any): Observable<any> {
    return this._schema$.pipe(
      switchMap((schema) => graphqlObservable(doc, schema, context))
    );
  }
}
