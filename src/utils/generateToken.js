import jwt from 'jsonwebtoken'
import { JWT_PRIVATEKEY } from '../config'

// See documentation : https://github.com/auth0/node-jsonwebtoken
export default function (dataObject, expirationDuration) {
  try {
    return jwt.sign(
      dataObject,
      JWT_PRIVATEKEY,
      {
        expiresIn: expirationDuration,
        algorithm: 'RS256',
      }
    )
  } catch (err) {
    throw err
  }
}
