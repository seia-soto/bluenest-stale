export const isAuthorizationFailure = (error: { status: number }) => {
  if (error.status === 401) {
    return true
  }

  return false
}
