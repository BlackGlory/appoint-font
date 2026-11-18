import { IStorage, StorageWithMemoryCache } from 'extra-webextension'
import { reusePendingPromises } from 'extra-promise'

/**
 * 包装Storage, 使其具有内存缓存和复用机制.
 */
export class FastStorage<
  Structure extends Record<string, unknown>
> implements IStorage<Structure> {
  private storageWithMemoryCache: StorageWithMemoryCache<Structure>

  constructor(storage: IStorage<Structure>) {
    this.storageWithMemoryCache = new StorageWithMemoryCache(storage)
  }

  getItem: <Key extends keyof Structure>(
    key: Key
  ) => Promise<Structure[Key] | undefined> = reusePendingPromises(key => {
    return this.storageWithMemoryCache.getItem(key)
  })

  setItem: <Key extends keyof Structure>(
    key: Key
  , value: Structure[Key]
  ) => Promise<void> = reusePendingPromises((key, value) => {
    return this.storageWithMemoryCache.setItem(key, value)
  })

  removeItem: <Key extends keyof Structure>(
    key: Key
  ) => Promise<void> = reusePendingPromises(key => {
    return this.storageWithMemoryCache.removeItem(key)
  })

  clear: () => Promise<void> = reusePendingPromises(() => {
    return this.storageWithMemoryCache.clear()
  })
}
