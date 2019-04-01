import jwt from 'jsonwebtoken'
import { SECRET } from '../../config'
import { AuthenticationError } from 'apollo-server-errors'
import User from '../../models/user.model'

async function uncryptToken (authToken) {
  const clearToken = jwt.verify(authToken, SECRET)
  if (clearToken) {
    return clearToken
  }
  throw new AuthenticationError('Authentication failed while checking validity token')
}

async function getTokenFromRequest (request) {
  const authorization = await request.headers['authorization']
  if (authorization) {
    const authToken = await authorization.replace('Bearer ', '')
    return authToken
  }
  throw new AuthenticationError('Authentication failed while searching token')
}

export default async function getTokenAndCurrentUser (request) {
  let authToken = null
  let clearToken = null
  let currentUser = null
  try {
    authToken = await getTokenFromRequest(request)
    if (authToken) {
      clearToken = await uncryptToken(authToken)
      currentUser = await User.findById(clearToken._id)
      console.log(`Successfully authenticated user : ${currentUser.firstname} ${currentUser.lastname}`)
    }
  } catch (err) {
    console.warn(err.message)
    console.warn(`Unable to authenticate using auth token: ${authToken}`)
  }
  return { clearToken, currentUser }
}
