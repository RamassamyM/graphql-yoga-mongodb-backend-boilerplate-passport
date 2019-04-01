import path from 'path'
import { makeExecutableSchema } from 'graphql-tools'
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas'
import { RequireAuth, Auth } from './utils/directives/requireAuth'
import { Computed } from './utils/directives/computed'
import { Deprecated } from './utils/directives/deprecated'
import { HasScope } from './utils/directives/hasScope'
// import { RestDirective } from './utils/directives/restDirective'

const logger = { log: e => console.log(e) }

const resolversArray = fileLoader(path.join(__dirname, './**/*.resolvers.js'), { recursive: true })
const resolvers = mergeResolvers(resolversArray)

const typesArray = fileLoader(path.join(__dirname, './**/*.graphql'), { recursive: true })
const typeDefs = mergeTypes(typesArray, { all: true })

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    requireAuth: RequireAuth,
    auth: Auth,
    deprecated: Deprecated,
    computed: Computed,
    hasScope: HasScope,
    // rest: Rest,
  },
  logger,
})

export default schema
