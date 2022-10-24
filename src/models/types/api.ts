export const enum EResponseStatus {
  Ok = 0,
  AuthorizationRequired,
  Rated,
  Nothing,
  NotOk
}

export const enum ECacheStatus {
  Unconfigured = 0,
  Hit,
  Miss
}

export interface IResponse<T = null> {
  status: EResponseStatus
  data?: T
}

export type TResponse<T> = IResponse<T | null>

export const CACHE_STATUS_HEADER = 'x-cache-status'
