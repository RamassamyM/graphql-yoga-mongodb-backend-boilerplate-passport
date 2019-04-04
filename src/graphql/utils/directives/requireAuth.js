import { SchemaDirectiveVisitor } from 'graphql-tools'
import { defaultFieldResolver } from 'graphql'
import { AuthenticationError } from 'apollo-server-errors'
import _get from 'lodash/get'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const userLocationInContext = 'req.currentUser'

export class RequireAuth extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field
    const { roles } = this.args
    field.resolve = async function (...args) {
      const [, , context] = args
      const user = _get(context, userLocationInContext)
      if (user) {
        if (roles && (!user.role || !roles.includes(user.role))) {
          throw new AuthenticationError(
            'You need an authorization to perform this action.'
          )
        } else {
          return resolve.apply(this, args)
        }
      } else {
        throw new AuthenticationError(
          'You must be signed in to view this resource.'
        )
      }
    }
  }
}

export class Auth extends SchemaDirectiveVisitor {
  visitObject (type) {
    this.ensureFieldsWrapped(type)
    type._requiredAuthRoles = this.args.requires
  }
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition (field, details) {
    this.ensureFieldsWrapped(details.objectType)
    field._requiredAuthRoles = this.args.requires
  }

  ensureFieldsWrapped (objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return
    objectType._authFieldsWrapped = true
    const fields = objectType.getFields()

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      const { resolve = defaultFieldResolver } = field
      field.resolve = async function (...args) {
        const [, , context] = args
        const user = _get(context, userLocationInContext)
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const roles = field._requiredAuthRoles || objectType._requiredAuthRoles
        if (user) {
          if (roles && (!user.role || !roles.includes(user.role))) {
            throw new AuthenticationError(
              'You are not authorized to view this resource.'
            )
          } else {
            return resolve.apply(this, args)
          }
        } else {
          throw new AuthenticationError(
            'You must be signed in to view this resource.'
          )
        }
      }
    })
  }
}
