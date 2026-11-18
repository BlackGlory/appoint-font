import { IFontList, IRule, ISessionStorage, SessionStorageItemKey } from '@src/contract'
import { isntUndefined, pipeAsync } from '@blackglory/prelude'
import { SessionStorage } from 'extra-webextension'
import { getFontList as _getFontList } from '@utils/font-list'
import { ToStruct } from 'hotypes'
import { FastStorage } from '@utils/fast-storage'
import { filterAsync, mapAsync, toArrayAsync } from 'iterable-operator'
import { convertRuleToCSS } from '@utils/convert-rule-to-css'

// 据说`chrome.storage.session`保存在内存里, 但仍然慢得惊人.
const sessionStorage = new FastStorage<ToStruct<ISessionStorage>>(
  new SessionStorage<ToStruct<ISessionStorage>>()
)

export async function getFontList(): Promise<IFontList> {
  const fontList = await sessionStorage.getItem(SessionStorageItemKey.FontList)
  if (fontList) {
    return fontList
  } else {
    const fontList = await _getFontList()
    await sessionStorage.setItem(SessionStorageItemKey.FontList, fontList)
    return fontList
  }
}

export async function createCSS({ rules, fontList }: {
  rules: IRule[]
  fontList: IFontList
}): Promise<string> {
  return await pipeAsync(
    rules
  , rules => mapAsync(rules, rule => convertRuleToCSS(rule, fontList))
  , cssResults => filterAsync(cssResults, isntUndefined)
  , toArrayAsync
  , cssFragments => cssFragments.join('\n')
  )
}
