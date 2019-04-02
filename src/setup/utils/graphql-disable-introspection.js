import graphql from 'graphql'
/**
 * No introspection: __schema and __type are disallowed in the query.
 */
export function NoIntrospection (context) {
  return {
    Field (node) {
      if (node.name.value === '__schema' || node.name.value === '__type') {
        context.reportError(
          new graphql.GraphQLError(
            'GraphQL introspection is not allowed, but the query contained __schema or __type',
            [node]
          )
        )
      }
    },
  }
}
