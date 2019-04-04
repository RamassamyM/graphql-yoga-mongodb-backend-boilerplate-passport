import passport from 'passport'
import FacebookStrategy from 'passport-facebook'
import User from './../../../models/user.model'
import { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET } from '../../../config'

export function setupFacebookStrategy () {
  const facebookOptions = {
    callbackURL: '/auth/facebook/callback',
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    profileFields: ['id', 'name', 'first_name', 'last_name', 'email'],
    passReqToCallback: true,
  }

  passport.use('facebook',
    new FacebookStrategy(
      facebookOptions,
      async function (req, accessToken, refreshToken, profile, done) {
        try {
          const user = await User.upsertFacebookUser({ accessToken, profile })
          done(null, user, req)
        } catch (err) {
          done(err, false, req)
        }
      }
    )
  )
}
