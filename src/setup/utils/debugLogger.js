import { GRAPHQL_DEBUG } from '../../config'

export function logRequest (req) {
  if (GRAPHQL_DEBUG) {
    console.log('\n\n\n' + req.method + ' ' + req.url + ' - referer: ' + req.headers.referer + ' - query name: ' + req.body.operationName + ' - variables:')
    console.log(req.body.variables)
  }
}

export function logResponse (res) {
  if (GRAPHQL_DEBUG) {
    console.log('Response: ')
    console.log(res)
  }
}
