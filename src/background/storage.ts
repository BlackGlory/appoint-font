import {
  ILocalStorage
, IConfigStore
, LocalStorageItemKey
, ISessionStorage
, SessionStorageItemKey
, IFontList
} from '@src/contract'
import { assert } from '@blackglory/prelude'
import { LocalStorage, SessionStorage } from 'extra-webextension'
import { generateFontList } from '@utils/font-list'
import { ToStruct } from 'hotypes'
import { StorageWithMemoryCache } from '@utils/storage-with-memory-cache'

// `chrome.storage`命名空间下的API性能很差, 一次读写操作的用时可能长达数十毫秒.
// 为了加快速度, 在外面套一层内存缓存.
const localStorage = new StorageWithMemoryCache(
  new LocalStorage<ToStruct<ILocalStorage>>()
)
const sessionStorage = new StorageWithMemoryCache(
  new SessionStorage<ToStruct<ISessionStorage>>()
)

export async function initLocalStorage(): Promise<void> {
  await localStorage.setItem(LocalStorageItemKey.Config, { rules: [] })
}

export async function setConfig(config: IConfigStore): Promise<null> {
  await localStorage.setItem(LocalStorageItemKey.Config, config)
  return null
}

export async function getConfig(): Promise<IConfigStore> {
  const config = await localStorage.getItem(LocalStorageItemKey.Config)
  // 扩展程序在启动后会执行迁移步骤, 在此之前请求都是挂起的, 因此config在调用时应该总是存在.
  assert(config)

  return config
}

export async function getFontList(): Promise<IFontList> {
  const fontList = await sessionStorage.getItem(SessionStorageItemKey.FontList)
  if (fontList) {
    return fontList
  } else {
    const fontList = await generateFontList()
    await sessionStorage.setItem(SessionStorageItemKey.FontList, fontList)
    return fontList
  }
}
