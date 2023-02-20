import {
  ILocalStorage
, IConfigStore
, LocalStorageItemKey
, ISessionStorage
, SessionStorageItemKey
, IFontList
} from '@src/contract'
import { LocalStorage, SessionStorage } from 'extra-webextension'
import { generateFontList } from '@utils/font-list'

const sessionStorage = new SessionStorage<ISessionStorage>()
const localStorage = new LocalStorage<ILocalStorage>()

export async function initLocalStorage(): Promise<void> {
  await localStorage.setItem(LocalStorageItemKey.Config, { rules: [] })
}

export async function setConfig(config: IConfigStore): Promise<null> {
  await localStorage.setItem(LocalStorageItemKey.Config, config)
  return null
}

export async function getConfig(): Promise<IConfigStore> {
  return await localStorage.getItem(LocalStorageItemKey.Config)
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
