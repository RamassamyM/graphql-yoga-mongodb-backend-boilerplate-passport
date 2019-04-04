import { setupFacebookTokenStrategy } from './strategies/facebookTokenStrategy'
import { setupGoogleTokenStrategy } from './strategies/googleTokenStrategy'
import { setupJwtStrategy } from './strategies/jwtStrategy'

export default function () {
  setupFacebookTokenStrategy()
  setupGoogleTokenStrategy()
  setupJwtStrategy()
}
