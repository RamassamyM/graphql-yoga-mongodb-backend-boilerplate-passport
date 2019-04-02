import { Strategy as LocalStrategy } from 'passport-local'
import User from './../../../models/user.model'

export default function (passport) {
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      async function (req, email, password, done) {
        User.findOne({ 'local.email': email }, async function (err, user) {
          if (err) { return done(err) }
          if (!user) {
            console.warn(`Unauthenticated because did not find email in db: ${email}`)
            return done(null, false)
          }
          if (!user.comparePassword(password)) { return done(null, false) }
          return done(null, user)
        })
      }
    )
  )
}
