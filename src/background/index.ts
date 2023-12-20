import { isntUndefined } from '@blackglory/prelude'
import { createServer } from '@delight-rpc/webextension'
import { IBackgroundAPI, IFontList, IRule, FontType } from '@src/contract'
import { createFontFaceRule } from '@utils/font-face'
import { getFontFamilyAliases, GenericFontFamily } from '@utils/font-family'
import { matchRuleMatcher } from '@utils/matcher'
import { dedent } from 'extra-tags'
import * as Iter from 'iterable-operator'
import { pipe } from 'extra-utils'
import { migrate } from './migrate'
import { all, Deferred } from 'extra-promise'
import { applyPropertyDecorators } from 'extra-proxy'
import { getConfig, setConfig, getFontList, initLocalStorage } from './storage'
import { waitForLaunch, LaunchReason } from 'extra-webextension'
import { ImplementationOf } from 'delight-rpc'

const launched = new Deferred<void>()

const api: ImplementationOf<IBackgroundAPI> = {
  getConfig
, setConfig
, getFontList
}

// 确保尽早启动服务器, 以免拒绝来自客户端的连接, 造成功能失效.
createServer<IBackgroundAPI>(
  applyPropertyDecorators(
    api
  , Object.keys(api) as Array<keyof IBackgroundAPI>
  , (fn: (...args: unknown[]) => unknown) => {
      return async function (...args: unknown[]): Promise<unknown> {
        // 等待初始化/迁移执行完毕
        await launched

        return await fn(...args)
      }
    }
  ) as ImplementationOf<IBackgroundAPI>
)

waitForLaunch().then(async details => {
  console.info(`Launched by ${LaunchReason[details.reason]}`)

  switch (details.reason) {
    case LaunchReason.Install: {
      // 在安装后打开设置页面.
      await initLocalStorage()

      await chrome.runtime.openOptionsPage()

      break
    }
    case LaunchReason.Update: {
      // 在升级后执行迁移.
      await migrate(details.previousVersion)
      break
    }
  }

  launched.resolve()
})

chrome.webNavigation.onCommitted.addListener(async ({ tabId, url }) => {
  const disallowedURLPatterns: RegExp[] = [
    /^chrome:/
  , /^chrome-extension:/
  ]
  if (disallowedURLPatterns.some(pattern => pattern.test(url))) return

  const { fontList, config } = await all({
    fontList: getFontList()
  , config: getConfig()
  })
  const filteredRules = config.rules
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

async function convertRuleToCSS(
  rule: IRule
, fontList: IFontList
): Promise<string | undefined> {
  const allFontList: string[] = Iter.toArray(Iter.uniq([
    ...fontList.all.map(x => x.fontId)
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
    ...fontList.monospace.map(x => x.fontId)
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
