import { IStorage, IConfigStore, StorageItemKey } from '@src/contract'
import { LocalStorage } from 'extra-webextension'

const storage = new LocalStorage<IStorage>()

export async function setConfig(config: IConfigStore): Promise<null> {
  await storage.setItem(StorageItemKey.Config, config)
  return null
}

export async function getConfig(): Promise<IConfigStore> {
  const result = await storage.getItem(StorageItemKey.Config)
  return result ?? {}
}