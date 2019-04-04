import { SchemaDirectiveVisitor } from 'graphql-tools'
import { defaultFieldResolver } from 'graphql'
import { AuthenticationError } from 'apollo-server-errors'
import _get from 'lodash/get'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const scopeLocationInContext = 'request.clearToken.scopes'

export class HasScope extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field
    const { scopes } = this.args

    field.resolve = async function (...args) {
      const [, , context] = args
      const providedScopes = await _get(context, scopeLocationInContext)
      if (scopes && (!providedScopes || !providedScopes.some(providedScope => scopes.includes(providedScope)))) {
        throw new AuthenticationError(
          'You need an authorization scope to perform this action.'
        )
      } else {
        return resolve.apply(this, args)
      }
    }
  }
}
