// Express
import { GraphQLServer } from 'graphql-yoga'
import schema from '../graphql/schema'
import morgan from 'morgan'
import helmet from 'helmet'
import getTokenAndCurrentUser from './utils/getTokenAndCurrentUser'
import { logRequest, logResponse } from './utils/debugLogger'
import NoIntrospection from 'graphql-disable-introspection'
// import passport from 'passport'
// import compression from 'compression'
import {
  PORT,
  SUBSCRIPTION_ENDPOINT,
  // CLIENT_ORIGIN,
  // SECRET,
  // COOKIE_DOMAIN,
  // COOKIE_NAME,
  PUBLIC_URL,
  GRAPHQL_ENDPOINT,
  PLAYGROUND_ENDPOINT,
  GRAPHQL_DEBUG,
  ENV,
} from '../config'

export default function () {
  console.log(`Starting server graphql in mode ${ENV}`)
  const rules = ENV === 'production' ? [NoIntrospection] : []
  const serverOptions = {
    port: PORT,
    endpoint: GRAPHQL_ENDPOINT,
    subscriptions: SUBSCRIPTION_ENDPOINT,
    playground: PLAYGROUND_ENDPOINT,
    debug: GRAPHQL_DEBUG || false,
    tracing: GRAPHQL_DEBUG || false,
    validationRules: rules,
    // https: {
    //   cert: CERT,
    //   key: KEY,
    // },
    // formatError: error => {
    //   console.log(error)
    //   return error
    // },
    formatResponse: res => {
      logResponse(res)
      return res
    },
  }
  const server = new GraphQLServer({
    // introspection: false,
    schema,
    playground: {
      settings: {
        'editor.theme': 'light',
      },
      tabs: [
        // {
        //   endpoint,
        //   query: defaultQuery,
        // },
      ],
    },
    context: async ({ request }) => {
      logRequest(request)
      const { clearToken, currentUser } = await getTokenAndCurrentUser(request)
      return { 'request': Object.assign({}, request, { 'currentUser': currentUser, 'clearToken': clearToken }) }
    },
  })

  server.express.use(helmet())
  server.express.use(morgan('dev'))
  server.start(serverOptions, ({ port }) => console.log(`🚀 API Server is running on port ${port} at ${PUBLIC_URL}${GRAPHQL_ENDPOINT}`))
  // console.log(`API Subscriptions server is now running on ${subscriptionsEndpoint}`)
}
