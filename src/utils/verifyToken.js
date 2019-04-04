import jwt from 'jsonwebtoken'
import { JWT_PUBLICKEY } from '../config'
import { AuthenticationError } from 'apollo-server-errors'

export async function verifyToken (authToken) {
  const clearToken = jwt.verify(authToken, JWT_PUBLICKEY, { algorithms: ['RS256'] })
  if (clearToken) {
    return clearToken
  }
  throw new AuthenticationError('Authentication failed while checking validity token')
}
