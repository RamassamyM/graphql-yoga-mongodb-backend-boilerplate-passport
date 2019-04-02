import passport from 'passport'
import passportGoogle from 'passport-google-oauth'
import User from './../../../models/user.model'

export function setupGoogleStrategy () {
  const passportConfig = {
    callbackURL: '/auth/google/redirect',
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENTSECRET,
  }

  const provider = 'google'

  passport.use(
    new passportGoogle.OAuth2Strategy(passportConfig, async function (
      request,
      accessToken,
      refreshToken,
      profile,
      done
    ) {
      try {
        const { id } = profile
        const email = profile.emails[0].value
        let user = await User.findOrCreate(email, { 'providerId': id }, provider, profile)
        done(null, user)
      } catch (e) {
        done(e)
      }
    })
  )
}
