import mongoose from 'mongoose'
import generateToken from '../utils/generateToken'
import { hashPassword, comparePassword } from './utils/passwordLib'

const userSchema = new mongoose.Schema({
  firstname: { type: String, default: undefined },
  lastname: { type: String, default: undefined },
  username: { type: String, default: undefined },
  avatarColor: { type: String, default: undefined },
  role: {
    type: String,
    default: 'user',
  },
  roleAdmin: {
    type: Boolean,
    default: false,
  },
  isSignedUp: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    unique: true,
  },
  password: { type: String, default: undefined },
  isAccountValidatedByEmail: {
    type: Boolean,
    default: false,
  },
  provider: String,
  providerId:{ type: String, unique: true },
  providerToken: String,
  refreshToken: String,
  displayNameByProvider: String,
  lastlogged: Date,
}, { timestamps: true })

userSchema.methods.validPassword = function (password) {
  return comparePassword(password, this.local.password)
}

userSchema.methods.generateHash = function (password) {
  return hashPassword(password)
}

userSchema.methods.generateJWT = function () {
  return generateToken({ _id: this._id, scopes: ['User:Read', 'User:Write'] }, '1d')
}

userSchema.statics.signup = async (_id, firstname, lastname, password, avatarColor) => {
  try {
    const userPromise = new Promise(async function (resolve, reject) {
      const foundUser = await User.findById(_id)
      if (!foundUser) {
        reject(new Error('There was a problem whith the user'))
      } else {
        if (foundUser.isSignedUp) {
          console.log(`Found user with id : ${_id}`)
          reject(new Error('This user has already signed up.'))
        }
        resolve(foundUser)
      }
    })
    const passwordPromise = new Promise(async function (resolve, reject) {
      const hashed = await hashPassword(password)
      if (!hashed) {
        reject(new Error('There was a problem wih hashing password'))
      } else {
        resolve(hashed)
      }
    })
    const [user, hashedPassword] = await Promise.all([userPromise, passwordPromise])
    await user.set({ 'local.password': hashedPassword, avatarColor, firstname, lastname, isSignedUp: true })
    await user.save()
    const token = await generateToken({ _id: user._id, scopes: ['User:Read', 'User:Write'] }, '1d')
    return { token, user }
  } catch (err) {
    throw err
  }
}

// function getGoogleAvatar (profile) {
//   if (profile.photos && profile.photos.length) {
//     return profile.photos[0].value
//   }
// }

function getEmail (profile) {
  if (profile.emails && profile.emails.length) {
    return profile.emails[0].value
  }
}

userSchema.statics.upsertGoogleUser = async function ({ accessToken, refreshToken, profile }) {
  const query = { 'providerId': profile.id }
  const update = {
    displayNameByProvider: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    username: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    firstname: profile._json.first_name || '',
    lastname: profile._json.last_name || '',
    email: profile.email || getEmail(profile) || '',
    // avatar: getGoogleAvatar(profile),
    providerToken: accessToken,
    provider: profile.provider || 'facebook',
    providerId: profile.id,
    refreshToken: refreshToken,
    isSignedUp: true,
  }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return User.findOneAndUpdate(query, update, options)
}

userSchema.statics.upsertFacebookUser = async function ({ accessToken, refreshToken, profile }) {
  const query = { 'providerId': profile.id }
  const update = {
    displayNameByProvider: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    username: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}` || `${profile._json.first_name} ${profile._json.last_name}`,
    firstname: profile._json.first_name || '',
    lastname: profile._json.last_name || '',
    email: profile.email || getEmail(profile) || '',
    providerToken: accessToken,
    provider: profile.provider || 'facebook',
    providerId: profile.id,
    refreshToken: refreshToken,
    isSignedUp: true,
  }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return User.findOneAndUpdate(query, update, options)
}

userSchema.statics.authenticate = async (email, password) => {
  try {
    // check if user exits
    const user = await User.findOne({ 'local.email': email })
    if (!user || !user.isSignedUp) {
      throw new Error('There was a problem with the email provided : the email does not exist or it has not been signed up.')
    }
    // if user, verify the user password with the password provided
    const isValidPassword = await comparePassword(password, user.local.password)
    if (!isValidPassword) {
      throw new Error('There was a problem with your password')
    }
    // assign the user a token
    const token = await generateToken({ _id: user._id, scopes: ['User:Read', 'User:Write'] }, '1d')
    return { token, user }
  } catch (err) {
    console.log(err)
    throw new Error('Error while trying to log in. Try again.')
  }
}

userSchema.statics.deleteWithPassword = async ({ _id, password }) => {
  try {
    const userToDelete = await User.findOne({ _id })
    if (!userToDelete) {
      throw new Error('There was a problem with this user')
    }
    const isValidPassword = await comparePassword(password, userToDelete.local.password)
    if (!isValidPassword) {
      throw new Error('There was a problem while trying to delete the user')
    }
    const deletedUser = await User.deleteOne({ _id })
    if (!deletedUser) {
      throw new Error('Error while trying to delete the user')
    }
    return { user: deletedUser, confirmed: true }
  } catch (err) {
    throw err
  }
}

const User = mongoose.model('User', userSchema)

export default User
