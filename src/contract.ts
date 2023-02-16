import { IRule } from '@utils/rule'
export { IRule, FontType, MatchType } from '@utils/rule'

export enum StorageItemKey {
  Config = 'config'
, FontList = 'fontList'
}

export interface IAPI {
  setConfig(config: IConfigStore): null
  getConfig(): IConfigStore
  setFontList(fontList: IFontList): null
  getFontList(): IFontList
}

export interface IStorage {
  [StorageItemKey.Config]?: IConfigStore
  [StorageItemKey.FontList]?: IFontList
}

export interface IFontList {
  all?: string[]
  monospace?: string[]
}

export interface IConfigStore {
  rules?: IRule[]
}
