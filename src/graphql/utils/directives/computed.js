import { DirectiveLocation, GraphQLDirective, GraphQLString, defaultFieldResolver } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

export class Computed extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration (directiveName = 'rest') {
    return new GraphQLDirective({
      name: directiveName,
      locations: [DirectiveLocation.FIELD_DEFINITION],
      args: {
        value: { type: GraphQLString },
      },
    })
  }

  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver, name } = field

    field.resolve = async (root, args, context, info) => {
      const result = await resolve.call(this, root, args, context, info)
      const updatedRoot = Object.assign(root, { [name]: result })
      let value = this.args.value
      for (const property in updatedRoot) {
        if (Object.prototype.hasOwnProperty) {
          value = value.replace(`$${property}`, updatedRoot[property])
        }
      }
      return value
    }
  }
}
