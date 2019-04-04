import passport from 'passport'
import FacebookStrategy from 'passport-facebook-token'
// import FacebookStrategy from 'passport-facebook'
import { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET } from '../../../config'

export function setupFacebookTokenStrategy () {
  const facebookOptions = {
    callbackURL: '/auth/facebook/callback',
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    profileFields: ['id', 'name', 'emails'],
  }
  const facebookTokenStrategyCallback = (accessToken, refreshToken, profile, done) => {
    done(null, {
      accessToken,
      refreshToken,
      profile,
    })
  }
  passport.use('facebook-token', new FacebookStrategy(facebookOptions, facebookTokenStrategyCallback))
}

export function authenticateFacebook (req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('facebook-token', { session: false }, (err, data, info) => {
      if (err) {
        reject(err)
      }
      resolve({ data, info })
    })(req, res)
  })
}
