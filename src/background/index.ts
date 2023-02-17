import { isntUndefined } from '@blackglory/prelude'
import { createServer } from '@delight-rpc/webextension'
import {
  IAPI
, IStorage
, IConfigStore
, IFontListStore
, StorageItemKey
, IRule
, FontType
} from '@src/contract'
import { createFontFaceRule } from '@utils/font-face'
import { getFontFamilyAliases, GenericFontFamily } from '@utils/font-family'
import { matchRuleMatcher } from '@utils/matcher'
import { dedent } from 'extra-tags'
import { uniq, mapAsync, filterAsync, toArray, toArrayAsync } from 'iterable-operator'
import { pipe } from 'extra-utils'
import { migrate } from './migrate'
import { generateFontLists } from '@utils/font-list'

createServer<IAPI>({
  getConfig
, setConfig
, setFontList
, getFontList
})

chrome.runtime.onInstalled.addListener(async ({ reason, previousVersion }) => {
  switch (reason) {
    case 'install': {
      // 在安装后打开设置页面.
      const optionsPageURL = 'chrome://extensions/?options=' + chrome.runtime.id
      await chrome.tabs.create({ url: optionsPageURL })
      break
    }
    case 'update': {
      // 在升级后执行迁移.
      if (previousVersion) {
        const currentVersion = chrome.runtime.getManifest().version
        await migrate(previousVersion, currentVersion)
      }
      break
    }
  }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  switch (changeInfo.status) {
    case 'loading':
    case 'complete': {
      const fontList = await getFontList()
      const config = await getConfig()
      const filteredRules = (config.rules ?? [])
        .filter(x => x.enabled)
        .filter(x => {
          if (x.matchersEnabled && tab.url) {
            const url = tab.url
            return x.matchers.some(matcher => matchRuleMatcher(url, matcher))
          } else {
            return true
          }
        })

      const css: string = await pipe(
        filteredRules
      , iter => mapAsync(iter, rule => convertRuleToCSS(rule, fontList))
      , iter => filterAsync(iter, isntUndefined)
      , toArrayAsync
      , async values => (await values).join('\n')
      )
      console.log({
        title: tab.title
      , url: tab.url
      , css
      })

      await chrome.scripting.insertCSS(
        {
          target: {
            tabId: tabId
          , allFrames: true
          }
        , css
        }
      )
    }
  }
})

async function setConfig(config: IConfigStore): Promise<null> {
  await chrome.storage.local.set({
    [StorageItemKey.Config]: config
  })

  return null
}

async function getConfig(): Promise<IConfigStore> {
  const storage: Pick<
    IStorage
  , StorageItemKey.Config
  > = await chrome.storage.local.get(StorageItemKey.Config)

  return storage[StorageItemKey.Config] ?? {}
}

async function setFontList(fontList: IFontListStore): Promise<null> {
  await chrome.storage.local.set({
    [StorageItemKey.FontList]: fontList
  })

  return null
}

async function getFontList(): Promise<IFontListStore> {
  const storage: Pick<
    IStorage
  , StorageItemKey.FontList
  > = await chrome.storage.local.get(StorageItemKey.FontList)

  const fontList = storage[StorageItemKey.FontList]
  if (fontList) {
    return fontList
  } else {
    const fontLists = await generateFontLists()
    await setFontList(fontLists)
    return fontLists
  }
}

async function convertRuleToCSS(
  rule: IRule
, fontList: IFontListStore
): Promise<string | undefined> {
  const allFontList: string[] = toArray(uniq([
    ...fontList.all ?? []
  , GenericFontFamily.Serif
  , GenericFontFamily.SansSerif
  , GenericFontFamily.Monospace
  , GenericFontFamily.Cursive
  , GenericFontFamily.Fantasy
  , GenericFontFamily.SystemUI
  , GenericFontFamily.UISerif
  , GenericFontFamily.UISansSerif
  , GenericFontFamily.UIMonospace
  , GenericFontFamily.UIRounded
  , GenericFontFamily.Emoji
  , GenericFontFamily.Math
  , GenericFontFamily.Fangsong
  ]))
  const monospaceFontList: string[] = toArray(uniq([
    ...fontList.monospace ?? []
  , GenericFontFamily.Monospace
  , GenericFontFamily.UIMonospace
  ]))

  if (rule.fontFamily) {
    const results: string[] = []
    for (const fontFamily of allFontList) {
      if (
        (
          !monospaceFontList.includes(fontFamily) &&
          rule.fontType === FontType.Standard
        ) || (
          monospaceFontList.includes(fontFamily) &&
          rule.fontType === FontType.FixedWidth
        )
      ) {
        for (const fontFamilyAlias of await getFontFamilyAliases(fontFamily)) {
          results.push(createFontFaceRule(
            fontFamilyAlias
          , await getFontFamilyAliases(rule.fontFamily)
          , {
              fontWeight: rule.fontWeightEnabled ? rule.fontWeight : undefined
            , unicodeRange: rule.unicodeRangeEnabled ? rule.unicodeRange : undefined
            }
          ))
        }
      }
    }
    return dedent`
      // Rule ID: ${rule.id}
      ${results.join('\n')}
    `
  }
}
