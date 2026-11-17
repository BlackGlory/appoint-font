import { isntUndefined } from '@blackglory/prelude'
import { createServer } from '@delight-rpc/webextension'
import { IBackgroundAPI } from '@src/contract'
import { matchRuleMatcher } from '@utils/matcher'
import { pipeAsync } from 'extra-utils'
import { migrate } from './migrate'
import { all, Deferred } from 'extra-promise'
import { applyPropertyDecorators } from 'extra-proxy'
import { getConfig, setConfig, getFontList, initLocalStorage } from './storage'
import { waitForLaunch, LaunchReason } from 'extra-webextension'
import { ImplementationOf } from 'delight-rpc'
import { convertRuleToCSS } from '@utils/convert-rule-to-css'
import { filterAsync, mapAsync, toArrayAsync } from 'iterable-operator'

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
  const { fontList, config } = await all({
    fontList: getFontList()
  , config: getConfig()
  })

  const filteredRules = config.rules
    .filter(rule => rule.enabled)
    .filter(rule => {
      return rule.matchersEnabled
           ? rule.matchers.some(matcher => matchRuleMatcher(url, matcher))
           : true
    })

  const css: string = await pipeAsync(
    filteredRules
  , rules => mapAsync(rules, rule => convertRuleToCSS(rule, fontList))
  , cssResults => filterAsync(cssResults, isntUndefined)
  , toArrayAsync
  , cssFragments => cssFragments.join('\n')
  )

  await chrome.scripting.insertCSS(
    {
      target: {
        tabId
      , allFrames: true
      }
    , css
    }
  )
})
