// Deprecated : use only in resolver but prefer schemadirectives

import { AuthenticationError } from 'apollo-server-errors'

// exemple : use in resolver :
// users: authenticated((root, args, context) => User.find({}, '_id email firstname lastname avatarColor')),
export const authenticated = next => (root, args, context, info) => {
  if (!context.currentUser) {
    throw new AuthenticationError('You need to be authenticated to access the ressource.')
  }
  return next(root, args, context, info)
}
