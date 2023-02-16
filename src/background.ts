import { isntUndefined } from '@blackglory/prelude'
import { createServer } from '@delight-rpc/webextension'
import {
  IAPI
, IStorage
, IConfigStore
, IFontList
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

createServer<IAPI>({
  getConfig
, setConfig
, setFontList
, getFontList
})

// 在安装后打开设置页面.
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    const optionsPageURL = 'chrome://extensions/?options=' + chrome.runtime.id
    await chrome.tabs.create({ url: optionsPageURL })
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

async function setConfig(_config: IConfigStore): Promise<null> {
  await chrome.storage.local.set({
    [StorageItemKey.Config]: _config
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

async function setFontList(_fontList: IFontList): Promise<null> {
  await chrome.storage.local.set({
    [StorageItemKey.FontList]: _fontList
  })

  return null
}

async function getFontList(): Promise<IFontList> {
  const storage: Pick<
    IStorage
  , StorageItemKey.FontList
  > = await chrome.storage.local.get(StorageItemKey.FontList)

  return storage[StorageItemKey.FontList] ?? {}
}

async function convertRuleToCSS(
  rule: IRule
, fontList: IFontList
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
