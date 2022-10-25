export const enum EServerCacheStatus {
  Miss = 0,
  Hit
}

export interface IResponseMeta {
  cache: {
    client: {
      exp: number
    }
    server: {
      iat: number
      status: EServerCacheStatus
    }
  }
}

export interface IResponse {
  meta: IResponseMeta
}

export interface IResponseWithData<T = unknown> extends IResponse {
  payload?: T
}
