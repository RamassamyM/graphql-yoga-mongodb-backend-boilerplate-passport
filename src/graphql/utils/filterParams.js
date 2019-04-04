// Deprecated : graphql schema already defines authorized permittedParams
export default async (params, filters) => {
  let permittedParams = {}
  await function () {
    for (let key in params) {
      if (filters.includes(key)) {
        permittedParams[key] = params[key]
      }
    }
  }
  return permittedParams
}
