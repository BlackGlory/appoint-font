import { createMigration } from 'extra-semver'
import { pipeAsync } from 'extra-utils'
import { assert } from '@blackglory/prelude'
import { nanoid } from 'nanoid'
import semver from 'semver'

export async function migrate(previousVersion: string): Promise<void> {
  // 强制将不规范的版本号转换为semver
  const previousSemver = semver.coerce(previousVersion)?.version
  assert(previousSemver, 'The previousSemver is undefined')

  await pipeAsync(
    previousSemver
  , createMigration('^2017.0.0', '2023.0.0', async () => {
      interface IOldStorage {
        config?: {
          fixed_width?: string
          standard?: string
        }
        fontList?: {
          default_fonts?: string[]
          monospace_fonts?: string[]
          standard_fonts?: string[]
        }
      }

      enum StorageItemKey {
        Config = 'config'
      , FontList = 'fontList'
      }

      interface IStorage {
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

      const oldStorage = await chrome.storage.local.get(null) as IOldStorage | undefined 
      const newStorage: IStorage = {
        config: {
          rules: []
        }
      }
      if (oldStorage?.config?.standard) {
        newStorage.config!.rules!.push({
          id: nanoid()
        , enabled: true
        , fontType: FontType.Standard
        , fontFamily: oldStorage.config.standard
        , matchers: []
        , matchersEnabled: false
        , fontWeight: ''
        , fontWeightEnabled: false
        , unicodeRange: ''
        , unicodeRangeEnabled: false
        })
      }
      if (oldStorage?.config?.fixed_width) {
        newStorage.config!.rules!.push({
          id: nanoid()
        , enabled: true
        , fontType: FontType.FixedWidth
        , fontFamily: oldStorage.config.fixed_width
        , matchers: []
        , matchersEnabled: false
        , fontWeight: ''
        , fontWeightEnabled: false
        , unicodeRange: ''
        , unicodeRangeEnabled: false
        })
      }
      await chrome.storage.local.clear()
      await chrome.storage.local.set(newStorage)
    })
  , createMigration('2023.0.0', '2023.0.1', async () => {
      // 不再存储fontList了, 直接让它在内存里.
      enum StorageItemKey {
        Config = 'config'
      , FontList = 'fontList'
      }

      await chrome.storage.local.remove(StorageItemKey.FontList)
    })
  )
}
