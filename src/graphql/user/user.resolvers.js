// import { GraphQLScalarType } from 'graphql'
// import moment from 'moment'
import User from '../../models/user.model'
import { WrongCredentialsError, EmailError, DeleteError, EditError } from './user.errors'
import getRandomAvatarColor from '../utils/getRandomAvatarColor'
// import { authenticated } from '../utils/authenticated'
import _get from 'lodash/get'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const userLocationInContext = 'request.currentUser'

export default {
  Query: {
    users: (root, args, context) => User.find({}, '_id email firstname lastname avatarColor'),
    user: (root, args, context) => User.findOne({ _id: args._id }, '_id firstname lastname avatarColor local.email'),
    me: (root, args, context) => context.request.currentUser,
  },
  User: {
    email: (user) => {
      if (user.local && user.local.email) return user.local.email
      if (user.facebook && user.facebook.email) return user.facebook.email
      if (user.google && user.google.email) return user.google.email
      return null
    },
    // fullname: (user) => `$(user.firstname) $(user.lastname)`,
  },
  Mutation: {
    registerWithEmail: async (root, { email }, context) => {
      try {
        const userWithSameEmailInDB = await User.findOne({ 'local.email': email })
        if (userWithSameEmailInDB) {
          console.log(`A connexion ask to register with email already used : ${email}`)
          throw new EmailError()
        }
        return User.create({ 'local.email': email })
      } catch (err) {
        throw err
      }
    },
    signup: async (root, { _id, firstname, lastname, password }, context) => {
      try {
        const user = _get(context, userLocationInContext)
        if (!user) {
          const avatarColor = await getRandomAvatarColor()
          return User.signup(_id, firstname, lastname, password, avatarColor)
        } else {
          throw new Error('User already authenticated')
        }
      } catch (err) {
        throw err
      }
    },
    login: async (root, { email, password }, context) => {
      try {
        const currentUser = _get(context, userLocationInContext)
        if (currentUser) {
          throw new Error('User already logged in')
        } else {
          const { token, user } = await User.authenticate(email, password)
          if (!token || !user) {
            throw new WrongCredentialsError()
          }
          return { token, user }
        }
      } catch (err) {
        throw err
      }
    },
    editUser: async (root, args, context) => {
      try {
        const options = { new: true, runValidators: true }
        const query = { _id: args._id }
        await delete args.__id
        return User.findOneAndUpdate(query, args, options)
      } catch (err) {
        console.log(err)
        throw new EditError('Error while trying to edit user.')
      }
    },
    deleteUserWithPassword: async (root, args, context) => {
      try {
        return User.deleteWithPassword(args)
      } catch (err) {
        console.log(err)
        throw new DeleteError('Error while deleting')
      }
    },
    deleteUser: async function (root, args, context) {
      const user = await User.findByIdAndRemove(args)
      if (!user) {
        throw new DeleteError('Error while deleting')
      }
      return user
    },
  },
}
