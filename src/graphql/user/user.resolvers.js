import { GraphQLScalarType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import moment from 'moment'
import User from '../../models/user.model'
import { WrongCredentialsError, EmailError, DeleteError, EditError } from './user.errors'
import getRandomAvatarColor from '../utils/getRandomAvatarColor'
import { authenticateFacebookPromise } from '../../setup/auth/strategies/facebookTokenStrategy'
import { authenticateGooglePromise } from '../../setup/auth/strategies/googleTokenStrategy'
import { authenticateLdapPromise } from '../../setup/auth/strategies/ldapStrategy'
// import { authenticated } from '../utils/authenticated'
import _get from 'lodash/get'

// The userLocationOnContext is defined in the creation of GraphqlServer in graphqlserver.js
const userLocationInContext = 'req.currentUser'

const throwErrorWithInfoFromPassport = (info) => {
  if (info && info.code) {
    switch (info.code) {
      case 'ETIMEDOUT':
        throw new Error('Failed to reach Authentication API: Try Again')
      default:
        throw new Error('Something went wrong with Authentication API')
    }
  } else {
    throw new Error(info.message || 'Data Error with Authentication API')
  }
}

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
      req.body = await Object.assign({}, req.body, { access_token: accessToken })
      console.log('Start authentication with Facebook')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateFacebookPromise(req, res)
        .then(({ data, info }) => data ? User.upsertFacebookUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('Server error with user'))
        .catch(err => { throw err })
    },
    authLdap: async (root, { input: { username, password } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { username: username, password: password })
      console.log('Start authentication with Ldap')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateLdapPromise(req, res)
        // .then(({ data, info }) => data ? console.log(data) : throwErrorWithInfoFromPassport(info))
        .then(({ data, info }) => data ? User.upsertLdapUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('Server error with user'))
        .catch(err => { throw err })
    },
    authGoogle: async (root, { input: { accessToken } }, { req, res }) => {
      req.body = await Object.assign({}, req.body, { access_token: accessToken })
      console.log('Start authentication with Google')
      // data contains the accessToken, refreshToken and profile from passport
      return authenticateGooglePromise(req, res)
        .then(({ data, info }) => data ? User.upsertGoogleUser(data) : throwErrorWithInfoFromPassport(info))
        .then(user => user ? ({ user: user, token: user.generateJWT() }) : new Error('Server error with user'))
        .catch(err => { throw err })
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
        console.log(err)
        throw new EditError('Error while trying to edit')
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
