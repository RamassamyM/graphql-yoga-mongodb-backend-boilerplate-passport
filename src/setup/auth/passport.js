import { setupGoogleStrategy } from './strategies/googleStrategy'
import { setupLocalStrategy } from './strategies/localStrategy'

export default function () {
  setupGoogleStrategy()
  // setupLocalStrategy()
}
