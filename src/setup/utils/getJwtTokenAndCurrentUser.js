import { verifyToken } from '../../utils/verifyToken'
import { AuthenticationError } from 'apollo-server-errors'
import User from '../../models/user.model'

async function getTokenFromRequest (req) {
  const authorization = await req.headers['authorization']
  if (authorization) {
    const authToken = await authorization.replace('Bearer ', '')
    return authToken
  }
  throw new AuthenticationError('Authentication failed while searching token')
}

export default async function getJwtTokenAndCurrentUser (req) {
  let authToken = null
  let clearToken = null
  let currentUser = null
  try {
    authToken = await getTokenFromRequest(req)
    if (authToken) {
      clearToken = await verifyToken(authToken)
      currentUser = await User.findById(clearToken._id)
      if (currentUser) {
        console.log(`Successfully authenticated user : ${currentUser.firstname} ${currentUser.lastname}`)
      } else {
        console.log('Unable to authenticate : user does not exist')
      }
    }
  } catch (err) {
    console.warn(`Unable to authenticate using auth token: ${authToken} \n Error message is :`)
    console.warn(err.message)
  }
  return { clearToken, currentUser }
}
