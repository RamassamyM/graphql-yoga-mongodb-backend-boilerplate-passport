import { GraphQLScalarType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import moment from 'moment'
import User from '../../models/user.model'
import { WrongCredentialsError, EmailError, DeleteError, EditError } from './user.errors'
import getRandomAvatarColor from '../utils/getRandomAvatarColor'
import { authenticateFacebook } from '../../setup/auth/strategies/facebookTokenStrategy'
import { authenticateGoogle } from '../../setup/auth/strategies/googleTokenStrategy'
// import { authenticated } from '../utils/authenticated'
import _get from 'lodash/get'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const userLocationInContext = 'req.currentUser'

export default {
  Query: {
    users: async (root, args, context) => User.find({}, '_id email firstname lastname avatarColor role username displayNameByProvider provider isSignedUp isAccountValidatedByEmail'),
    user: async (root, args, context) => User.findOne({ _id: args._id }, '_id firstname lastname avatarColor email username'),
    me: async (root, args, context) => context.req.currentUser,
  },
  User: {
    // fullname: (user) => `$(user.firstname) $(user.lastname)`,
  },
  Mutation: {
    authFacebook: async (root, { input: { accessToken } }, { req, res }) => {
      try {
        req.body = await Object.assign({}, req.body, { access_token: accessToken })
        // data contains the accessToken, refreshToken and profile from passport
        console.log('Start authenticate with Facebook')
        const { data, info } = await authenticateFacebook(req, res)
        // console.log(data)
        if (data) {
          const user = await User.upsertFacebookUser(data)
          if (user) {
            return ({
              user: user,
              token: await user.generateJWT(),
            })
          } else {
            return new Error('Server error')
          }
        } else {
          if (info) {
            // console.log(info)
            switch (info.code) {
              case 'ETIMEDOUT':
                return (new Error('Failed to reach Facebook: Try Again'))
              default:
                return (new Error('Something went wrong while trying to reach Facebook API'))
            }
          } else {
            return new Error('No data received from Facebook authentication')
          }
        }
      } catch (err) {
        throw err
      }
    },
    authGoogle: async (root, { input: { accessToken } }, { req, res }) => {
      req.body = Object.assign({}, req.body, { access_token: accessToken })
      try {
        // data contains the accessToken, refreshToken and profile from passport
        const { data, info } = await authenticateGoogle(req, res)
        if (data) {
          const user = await User.upsertGoogleUser(data)
          if (user) {
            return ({
              user: user,
              token: user.generateJWT(),
            })
          } else {
            return new Error('Server error')
          }
        } else {
          if (info) {
            console.log(info)
            switch (info.code) {
              case 'ETIMEDOUT':
                return (new Error('Failed to reach Google: Try Again'))
              default:
                return (new Error('Something went wrong while trying to reach Google API'))
            }
          } else {
            return new Error('No data received from Google authentication')
          }
        }
      } catch (err) {
        throw err
      }
    },
    registerWithEmail: async (root, { email }, context) => {
      try {
        const userWithSameEmailInDB = await User.findOne({ email })
        if (userWithSameEmailInDB) {
          console.log(`A connexion ask to register with email already used : ${email}`)
          throw new EmailError()
        }
        return User.create({ email })
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
        throw err
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
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value) => moment(value).toDate(),
    serialize: (value) => value.getTime(),
    parseLiteral: (ast) => ast,
  }),
  JSON: GraphQLJSON,
}
