import passport from 'passport'
import LdapStrategy from 'passport-ldapauth'
import { LDAP_URL, LDAP_BASE, PATH_TO_TLS_LDAP_PUBLIC_KEY, LDAP_SEARCH_FILTER } from '../../../config'
import fs from 'fs'

export function setupLdapTokenStrategy () {
  const ldapOptions = {
    server: {
      url: LDAP_URL,
      searchBase: LDAP_BASE,
      searchFilter: LDAP_SEARCH_FILTER,
      searchAttributes: ['displayName', 'mail', 'givenName', 'uidNumber', 'uid'],
      tlsOptions: {
        ca: [ fs.readFileSync(PATH_TO_TLS_LDAP_PUBLIC_KEY) ],
      },
    },
  }
  const ldapTokenStrategyCallback = (userLdap, done) => {
    done(null, { userLdap })
  }
  passport.use(new LdapStrategy(ldapOptions, ldapTokenStrategyCallback))
}

export function authenticateLdapPromise (req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate('ldapauth', { session: false }, (err, data, info) => {
      err ? reject(err) : console.log({ data, info })
      resolve({ data, info })
    })(req, res, (err) => {
      throw err
    })
  })
}
