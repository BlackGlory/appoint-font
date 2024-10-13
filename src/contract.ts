export enum LocalStorageItemKey {
  Config = 'config'
}

export enum SessionStorageItemKey {
  FontList = 'fontList'
}

export interface IBackgroundAPI {
  setConfig(config: IConfigStore): null
  getConfig(): IConfigStore
  getFontList(): IFontList
}

export interface ILocalStorage {
  [LocalStorageItemKey.Config]: IConfigStore
}

export interface ISessionStorage {
  [SessionStorageItemKey.FontList]?: IFontList
}

export interface IFontList {
  all: chrome.fontSettings.FontName[]
  monospace: chrome.fontSettings.FontName[]
}

export interface IConfigStore {
  rules: IRule[]
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

  matchersEnabled: boolean
  matchers: Matcher[]

  subFontFamilyEnabled: boolean
  subFontFamily: string

  fontWeightEnabled: boolean
  fontWeight: string

  unicodeRangeEnabled: boolean
  unicodeRange: string
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
