class MemoryStorage {
  source: Map<string, string>
  keys: string[] = []

  getItem (key: string) {
    return this.source.get(key)
  }

  setItem (key: string, value: string) {
    return this.source.set(key, value)
  }

  removeItem (key: string) {
    return this.source.delete(key)
  }

  clear () {
    this.source = new Map<string, string>()
  }
}

class PersistStorage {
  source: Storage | MemoryStorage

  constructor () {
    if (typeof window === 'undefined') {
      this.source = new MemoryStorage()
    } else if (typeof window.localStorage !== 'undefined') {
      this.source = window.localStorage
    } else if (typeof window.sessionStorage !== 'undefined') {
      this.source = window.sessionStorage
    }

    if (!this.source) {
      throw new Error('Failed to initiate persist storage for fetch cache!')
    }
  }

  get (key: string) {
    return this.source.getItem(key)
  }

  set (key: string, value: string) {
    return this.source.setItem(key, value)
  }

  del (key: string) {
    return this.source.removeItem(key)
  }

  clear () {
    return this.source.clear()
  }
}

export const persistStorage = new PersistStorage()
