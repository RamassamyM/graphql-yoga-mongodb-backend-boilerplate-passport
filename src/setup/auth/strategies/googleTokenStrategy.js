import passport from 'passport'
import { Strategy as GoogleTokenStrategy } from 'passport-google-token'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../../config'

export function setupGoogleTokenStrategy () {
  const googleOptions = {
    callbackURL: '/auth/google/callback',
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  }
  const GoogleTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
  })

  passport.use('google', new GoogleTokenStrategy(googleOptions, GoogleTokenStrategyCallback))
}
/* eslint-disable no-new */
export function authenticateGooglePromise (req, res) {
  new Promise((resolve, reject) => {
    passport.authenticate('google', { session: false }, (err, data, info) => {
      err ? reject(err) : resolve({ data, info })
    })(req, res)
  })
}
