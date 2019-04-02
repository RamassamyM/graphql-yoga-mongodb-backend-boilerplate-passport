import { GRAPHQL_DEBUG } from '../../config'

export function logRequest (request) {
  if (GRAPHQL_DEBUG) {
    console.log('\n\n\n' + request.method + ' ' + request.url + ' - referer: ' + request.headers.referer + ' - query name: ' + request.body.operationName + ' - variables:')
    console.log(request.body.variables)
  }
}

export function logResponse (response) {
  if (GRAPHQL_DEBUG) {
    console.log('_Response: ')
    console.log(response)
  }
}
