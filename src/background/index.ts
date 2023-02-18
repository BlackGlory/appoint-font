import { isntUndefined } from '@blackglory/prelude'
import { createServer } from '@delight-rpc/webextension'
import {
  IBackgroundAPI
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
import * as Iter from 'iterable-operator'
import { pipe } from 'extra-utils'
import { migrate } from './migrate'
import { generateFontLists } from '@utils/font-list'
import { all } from 'extra-promise'

createServer<IBackgroundAPI>({
  getConfig
, setConfig
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

chrome.webNavigation.onCommitted.addListener(async ({ tabId, url }) => {
  const { fontList, config } = await all({
    fontList: getFontList()
  , config: getConfig()
  })
  const filteredRules = (config.rules ?? [])
    .filter(x => x.enabled)
    .filter(x => {
      if (x.matchersEnabled) {
        return x.matchers.some(matcher => matchRuleMatcher(url, matcher))
      } else {
        return true
      }
    })

  const css: string = await pipe(
    filteredRules
  , iter => Iter.mapAsync(iter, rule => convertRuleToCSS(rule, fontList))
  , iter => Iter.filterAsync(iter, isntUndefined)
  , Iter.toArrayAsync
  , async values => (await values).join('\n')
  )
  console.log({ url, css })

  await chrome.scripting.insertCSS(
    {
      target: {
        tabId: tabId
      , allFrames: true
      }
    , css
    }
  )
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

async function getFontList(): Promise<IFontList> {
  const fontLists = await generateFontLists()
  return fontLists
}

async function convertRuleToCSS(
  rule: IRule
, fontList: IFontList
): Promise<string | undefined> {
  const allFontList: string[] = Iter.toArray(Iter.uniq([
    ...fontList.all.map(x => x.fontId) ?? []
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
  const monospaceFontList: string[] = Iter.toArray(Iter.uniq([
    ...fontList.monospace.map(x => x.fontId) ?? []
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
