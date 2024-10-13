import { createMigration } from 'extra-semver'
import { pipeAsync } from 'extra-utils'
import { assert } from '@blackglory/prelude'
import { nanoid } from 'nanoid'
import semver from 'semver'
import { LocalStorage } from 'extra-webextension'

export async function migrate(previousVersion: string): Promise<void> {
  // 强制将不规范的版本号转换为semver
  const previousSemver = semver.coerce(previousVersion)?.version
  assert(previousSemver, 'The previousSemver is undefined')

  await pipeAsync(
    previousSemver
  , createMigration('^2017.0.0', '2023.0.0', async () => {
      enum StorageItemKey {
        Config = 'config'
      , FontList = 'fontList'
      }

      interface IOldStorage {
        [StorageItemKey.Config]?: {
          fixed_width?: string
          standard?: string
        }
        [StorageItemKey.FontList]?: {
          default_fonts?: string[]
          monospace_fonts?: string[]
          standard_fonts?: string[]
        }
      }

      interface INewStorage {
        [StorageItemKey.Config]?: IConfigStore
        [StorageItemKey.FontList]?: IFontList
      }

      interface IFontList {
        all?: string[]
        monospace?: string[]
      }

      interface IConfigStore {
        rules?: IRule[]
      }

      enum FontType {
        Standard
      , FixedWidth
      }

      enum MatchType {
        URL
      , Host
      }

      interface IRule {
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

      type Matcher =
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

      const oldStorage = new LocalStorage<IOldStorage>()
      const newStorage = new LocalStorage<INewStorage>()
      const oldConfig = await oldStorage.getItem(StorageItemKey.Config)
      const newConfig: INewStorage[StorageItemKey.Config]  = {
        rules: []
      }
      if (oldConfig?.standard) {
        newConfig.rules!.push({
          id: nanoid()
        , enabled: true
        , fontType: FontType.Standard
        , fontFamily: oldConfig.standard
        , matchers: []
        , matchersEnabled: false
        , fontWeight: ''
        , fontWeightEnabled: false
        , unicodeRange: ''
        , unicodeRangeEnabled: false
        })
      }
      if (oldConfig?.fixed_width) {
        newConfig.rules!.push({
          id: nanoid()
        , enabled: true
        , fontType: FontType.FixedWidth
        , fontFamily: oldConfig.fixed_width
        , matchers: []
        , matchersEnabled: false
        , fontWeight: ''
        , fontWeightEnabled: false
        , unicodeRange: ''
        , unicodeRangeEnabled: false
        })
      }
      await oldStorage.clear()
      await newStorage.setItem(StorageItemKey.Config, newConfig)
    })
  , createMigration('2023.0.0', '2023.0.1', async () => {
      // 不再存储fontList了, 直接让它在内存里.
      enum StorageItemKey {
        Config = 'config'
      , FontList = 'fontList'
      }

      interface IOldStorage {
        [StorageItemKey.Config]?: IConfigStore
        [StorageItemKey.FontList]?: IFontList
      }

      interface INewStorage {
        [StorageItemKey.Config]?: IConfigStore
      }

      interface IConfigStore {
        rules?: IRule[]
      }

      enum FontType {
        Standard
      , FixedWidth
      }

      enum MatchType {
        URL
      , Host
      }

      interface IRule {
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

      type Matcher =
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

      interface IFontList {
        all?: string[]
        monospace?: string[]
      }

      const oldStorage = new LocalStorage<IOldStorage>()
      await oldStorage.removeItem(StorageItemKey.FontList)
    })
  , createMigration('2023.0.1 || 2023.0.2', '2023.0.3', async () => {
      enum StorageItemKey {
        Config = 'config'
      }

      interface IOldStorage {
        [StorageItemKey.Config]?: IOldConfigStore
      }

      interface INewStorage {
        [StorageItemKey.Config]: INewConfigStore
      }

      interface IOldConfigStore {
        rules?: IRule[]
      }

      interface INewConfigStore {
        rules: IRule[]
      }

      interface IRule {
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

      type Matcher =
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

      enum FontType {
        Standard
      , FixedWidth
      }

      enum MatchType {
        URL
      , Host
      }

      // Make sure storage is initialized
      const oldStorage = new LocalStorage<IOldStorage>()
      const newStorage = new LocalStorage<INewStorage>()

      const config = await oldStorage.getItem(StorageItemKey.Config)
      await newStorage.setItem(
        StorageItemKey.Config
      , { rules: config?.rules ?? [] }
      )
    })
  , createMigration('>=2023.0.3 <2024.1.0', '2024.1.0', async () => {
      enum LocalStorageItemKey {
        Config = 'config'
      }

      interface IOldLocalStorage {
        [LocalStorageItemKey.Config]: IOldConfigStore
      }

      interface INewLocalStorage {
        [LocalStorageItemKey.Config]: INewConfigStore
      }

      interface IOldConfigStore {
        rules: IOldRule[]
      }

      interface INewConfigStore {
        rules: INewRule[]
      }

      interface IOldRule {
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

      interface INewRule {
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

      enum FontType {
        Standard
      , FixedWidth
      }

      enum MatchType {
        URL
      , Host
      }

      type Matcher =
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

      const oldStorage = new LocalStorage<IOldLocalStorage>()
      const newStorage = new LocalStorage<INewLocalStorage>()

      const config = await oldStorage.getItem(LocalStorageItemKey.Config)
      await newStorage.setItem(
        LocalStorageItemKey.Config
      , {
          rules: config.rules.map(rule => {
            return {
              ...rule
            , subFontFamilyEnabled: false
            , subFontFamily: ''
            }
          })
        }
      )
    })
  )
}
