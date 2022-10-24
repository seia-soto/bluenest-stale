interface Driver {
  source?: unknown

  get: (key: string) => string

  set: (key: string, value: string) => void

  del: (key: string) => void

  bulkDelPrefixed: (key: string) => void
}

export class MemoryDriver implements Driver {
  source: Map<string, string>

  constructor () {
    this.source = new Map()
  }

  get (key: string) {
    return this.source.get(key)
  }

  set (key: string, value: string) {
    this.source.set(key, value)
  }

  del (key: string) {
    this.source.delete(key)
  }

  bulkDelPrefixed (prefix: string) {
    Array
      .from(this.source.keys())
      .forEach(key => {
        if (key.startsWith(prefix)) {
          this.del(key)
        }
      })
  }
}

export class WebStorageDriver implements Driver {
  source: Storage

  constructor (type: 'local' | 'session') {
    if (type === 'local') {
      this.source = window.localStorage
    } else {
      this.source = window.sessionStorage
    }
  }

  get (key: string) {
    return this.source.getItem(key)
  }

  set (key: string, value: string) {
    this.source.setItem(key, value)
  }

  del (key: string) {
    this.source.removeItem(key)
  }

  bulkDelPrefixed (prefix: string) {
    const keys: string[] = []

    for (let i = 0; i < this.source.length; i++) {
      keys.push(this.source.key(i))
    }

    keys
      .forEach(key => {
        if (key.startsWith(prefix)) {
          this.del(key)
        }
      })
  }
}

export type TExternDrivers = 'memory' | 'localStorage' | 'sessionStorage'

export const externs = new Map<TExternDrivers | 'recent', Driver>()

export const getDriverFromExternDependencies = (type: TExternDrivers) => {
  let driver: Driver = externs.get(type)

  if (!driver) {
    switch (type) {
      case 'memory': {
        driver = new MemoryDriver()
        externs.set('memory', driver)

        break
      }
      case 'localStorage': {
        driver = new WebStorageDriver('local')
        externs.set('localStorage', driver)

        break
      }
      case 'sessionStorage': {
        driver = new WebStorageDriver('session')
        externs.set('sessionStorage', driver)

        break
      }
    }
  }

  externs.set('recent', driver)

  return driver
}

export const getDriver = () => {
  const recent = externs.get('recent')

  if (recent) {
    return recent
  }

  if (typeof window === 'undefined') {
    return getDriverFromExternDependencies('memory')
  }

  if (typeof window.localStorage !== 'undefined') {
    return getDriverFromExternDependencies('localStorage')
  }

  if (typeof window.sessionStorage !== 'undefined') {
    return getDriverFromExternDependencies('sessionStorage')
  }

  return getDriverFromExternDependencies('memory')
}
