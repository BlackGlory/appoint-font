import { IFontList, IRule } from '@src/contract'
import { go, isntUndefined, pipeAsync } from '@blackglory/prelude'
import { SessionStorage } from 'extra-webextension'
import { getFontList as _getFontList } from '@utils/font-list'
import { FastStorage } from '@utils/fast-storage'
import { filterAsync, mapAsync, toArrayAsync } from 'iterable-operator'
import { convertRuleToCSS } from '@utils/convert-rule-to-css'
import { memoizeAsync, IAsyncCache, State } from 'extra-memoize'
import { LRUCache } from '@extra-memoize/memory-cache'

const sessionCache: IAsyncCache<unknown> = go(() => {
  const sessionStorage = new FastStorage<Record<string, unknown>>(
    // 据说`chrome.storage.session`直接保存在内存里, 但仍然很慢.
    new SessionStorage()
  )

  return {
    async get(key) {
      const value = await sessionStorage.getItem(key)

      return isntUndefined(value)
           ? [State.Hit, value]
           : [State.Miss]
    }
  , async set(key, value) {
      await sessionStorage.setItem(key, value)
    }
  }
})

export const getFontList = memoizeAsync(
  {
    cache: sessionCache
  , createKey: () => 'getFontList'
  }
, _getFontList
)

export const createCSS = memoizeAsync(
  {
    // 该函数不能使用session作为缓存,
    // 因为session有10MB的容量限制, 而生成的单条缓存记录很轻松就超过100KB.
    // 为了不把session占满, 需要为其专门设计过时缓存清除机制, 而这在session上实现起来并不方便.
    cache: new LRUCache(20)
  }
, ({ rules, fontList }: {
    rules: IRule[]
    fontList: IFontList
  }): Promise<string> => pipeAsync(
    rules
  , rules => mapAsync(rules, rule => convertRuleToCSS(rule, fontList))
  , cssResults => filterAsync(cssResults, isntUndefined)
  , toArrayAsync
  , cssFragments => cssFragments.join('\n')
  )
)
