import { setupFacebookTokenStrategy } from './strategies/facebookTokenStrategy'
import { setupGoogleTokenStrategy } from './strategies/googleTokenStrategy'
import { setupJwtStrategy } from './strategies/jwtStrategy'
import { setupLdapTokenStrategy } from './strategies/ldapStrategy'

export default function () {
  setupFacebookTokenStrategy()
  setupLdapTokenStrategy()
  setupGoogleTokenStrategy()
  setupJwtStrategy()
}
