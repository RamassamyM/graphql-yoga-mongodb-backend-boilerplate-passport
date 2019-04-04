import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { JWT_SECRET } from '../../../config'
import User from './../../../models/user.model'

export function setupJwtStrategy () {
  const options = {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    // passReqToCallback: true, // allows us to pass back the entire request to the callback : to do that add req to the function calbback
  }
  passport.use(
    'jwt',
    new JwtStrategy(options, (jwtPayload, done) => {
      User.findOne({ _id: jwtPayload._id }, async function (err, user) {
        if (err) {
          console.warn(err.message)
          return done(null, false)
        }
        if (!user) {
          console.warn(`Unauthenticated because did not find user in db with token:`)
          console.warn(jwtPayload)
          return done(null, false)
        }
        return done(null, user)
      })
    }
    )
  )
}
