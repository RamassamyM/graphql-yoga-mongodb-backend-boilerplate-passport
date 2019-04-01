import mongoose from 'mongoose'
import generateToken from './utils/generateToken'
import { hashPassword, comparePassword } from './utils/passwordLib'

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  avatarColor: String,
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
  local: {
    email: {
      type: String,
      unique: true,
    },
    password: String,
    isAccountValidatedByEmail: {
      type: Boolean,
      default: false,
    },
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    email: String,
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String,
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
}, { timestamps: true })

userSchema.methods.validPassword = function (password) {
  return comparePassword(password, this.local.password)
}

userSchema.methods.generateHash = function (password) {
  return hashPassword(password)
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
    const token = await generateToken({ _id: user._id, scopes: ['User:Read', 'User:Write'] })
    return { token, user }
  } catch (err) {
    throw err
  }
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
    const token = await generateToken({ _id: user._id, scopes: ['User:Read', 'User:Write'] })
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
