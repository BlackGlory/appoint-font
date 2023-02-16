import { toArray } from '@blackglory/prelude'
import { createServer } from '@delight-rpc/webextension'
import {
  IAPI
, IStorage
, IConfigStore
, IFontList
, StorageItemKey
} from '@src/contract'
import { createFontFaceRule } from '@utils/font-face'
import { getFontFamilyAliases, GenericFontFamily } from '@utils/font-family'
import { IRule, matchRuleMatcher, FontType } from '@utils/rule'
import { uniq } from 'iterable-operator'

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
      const filteredRules = [
        ...(config.rules ?? [])
          .filter(x => x.enabled)
          .filter(x => {
            if (x.matcher && tab.url) {
              return matchRuleMatcher(tab.url, x.matcher)
            } else {
              return true
            }
          })
      ]

      const css: string = filteredRules
        .map(rule => convertRuleToCSS(rule, fontList))
        .join('\n')

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

async function convertRuleToCSS(rule: IRule, fontList: IFontList): Promise<string> {
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
              fontWeight: rule.fontWeight
            , unicodeRange: rule.unicodeRange
            }
          ))
        }
      }
    }
    return results.join('\n')
  } else {
    return ''
  }
}
