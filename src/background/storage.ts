import { ILocalStorage, IConfigStore, LocalStorageItemKey } from '@src/contract'
import { assert } from '@blackglory/prelude'
import { LocalStorage } from 'extra-webextension'
import { ToStruct } from 'hotypes'
import { FastStorage } from '@utils/fast-storage'

// `chrome.storage`命名空间下的API性能很差, 一次读写操作的用时可能长达数十毫秒.
const localStorage = new FastStorage<ToStruct<ILocalStorage>>(
  new LocalStorage<ToStruct<ILocalStorage>>()
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
