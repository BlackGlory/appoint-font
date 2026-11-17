import { LocalStorage, SessionStorage } from 'extra-webextension'
import { reusePendingPromises } from 'extra-promise'
import { toArray } from '@blackglory/prelude'

export class StorageWithMemoryCache<Storage extends Record<string, unknown>> {
  private keyToValue = new Map<
    keyof Storage
  , Storage[keyof Storage] | undefined
  >()

  constructor(private storage: LocalStorage<Storage> | SessionStorage<Storage>) {}

  getItem: <Key extends keyof Storage>(
    key: Key
  ) => Promise<Storage[Key] | undefined> = reusePendingPromises(
    async <Key extends keyof Storage>(key: Key): Promise<Storage[Key] | undefined> => {
      if (this.keyToValue.has(key)) {
        return this.keyToValue.get(key) as Storage[Key]
      } else {
        const value = await this.storage.getItem(key)

        this.keyToValue.set(key, value)

        return value
      }
    }
  )

  setItem: <Key extends keyof Storage>(
    key: Key
  , value: Storage[Key]
  ) => Promise<void> = reusePendingPromises(
    async <Key extends keyof Storage>(key: Key, value: Storage[Key]): Promise<void> => {
      this.keyToValue.set(key, value)

      await this.storage.setItem(key, value)
    }
  )

  removeItem: <Key extends keyof Storage>(
    key: Key
  ) => Promise<void> = reusePendingPromises(
    async <Key extends keyof Storage>(key: Key): Promise<void> => {
      this.keyToValue.set(key, undefined)

      await this.storage.removeItem(key)
    }
  )

  clear: () => Promise<void> = reusePendingPromises(async (): Promise<void> => {
    const keys = toArray(this.keyToValue.keys())
    keys.forEach(key => this.keyToValue.set(key, undefined))

    await this.storage.clear()
  })
}
