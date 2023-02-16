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

export enum FontType {
  Standard
, FixedWidth
}

export enum MatchType {
  URL
, Host
}

export interface IRule {
  id: string
  enabled: boolean
  fontType: FontType
  fontFamily: string

  matchers: Matcher[]
  matchersEnabled: boolean

  fontWeight: string
  fontWeightEnabled: boolean

  unicodeRange: string
  unicodeRangeEnabled: boolean
}

export type Matcher =
| IURLMatcher
| IHostMatcher

interface IURLMatcher {
  type: MatchType.URL
  pattern: string
}

interface IHostMatcher {
  type: MatchType.Host
  pattern: string
}
