import { go } from '@blackglory/prelude'
import { lazyFunction, lazyAsyncFunction } from 'extra-lazy'
import { getBrowserFontList } from '@utils/font-settings'

/**
 * 来自<https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#values>
 */
export enum GenericFontFamily {
  Serif = 'serif'
, SansSerif = 'sans-serif'
, Monospace = 'monospace'
, Cursive = 'cursive'
, Fantasy = 'fantasy'
, SystemUI = 'system-ui'
, UISerif = 'ui-serif'
, UISansSerif = 'ui-sans-serif'
, UIMonospace = 'ui-monospace'
, UIRounded = 'ui-rounded'
, Emoji = 'emoji'
, Math = 'math'
, Fangsong = 'fangsong'
}

export const getFontFamilyAliases = go(() => {
  // 该函数在生成CSS时被高频调用, 使用通用的缓存库反而会降速.
  const fontFamilyToAliases: Map<string, string[]> = new Map()

  return async (fontFamily: string): Promise<string[]> => {
    const result = fontFamilyToAliases.get(fontFamily)
    if (result) {
      return result
    } else {
      const result: string[] = [
        ...getFontFamilyAliasesFromCommonFontAliasPairs(fontFamily)
      , ...await getFontFamilyAliasesFromBrowserFontList(fontFamily)
      ]

      fontFamilyToAliases.set(fontFamily, result)

      return result
    }
  }
})

/**
 * 从浏览器API处查找fontFamily的别名.
 */
const getFontFamilyAliasesFromBrowserFontList: (
  fontFamily: string
) => Promise<string[]> = lazyAsyncFunction(async () => {
  const fontList = await getBrowserFontList()

  const fontFamilyToAliases: Map<string, string[]> = new Map(
    fontList.flatMap(font => {
      const fontAliases = [font.displayName, font.fontId]

      return fontAliases.map(fontFamily => [fontFamily, fontAliases])
    })
  )

  return fontFamily => fontFamilyToAliases.get(fontFamily) ?? []
})

/**
 * 从硬编码的常见字体别名里查找fontFamily的别名.
 */
const getFontFamilyAliasesFromCommonFontAliasPairs: (
  fontFamily: string
) => string[] = lazyFunction(() => {
  const commonFontAliasPairs = [
    ['宋体', 'SimSun']
  , ['黑体', 'SimHei']
  , ['微软雅黑', 'Microsoft YaHei']
  , ['微软正黑体', 'Microsoft JhengHei']
  , ['新宋体', 'NSimSun']
  , ['新细明体', 'PMingLiU']
  , ['细明体', 'MingLiU']
  , ['标楷体', 'DFKai-SB', 'BiauKai']
  , ['仿宋', 'FangSong']
  , ['楷体', 'KaiTi']
  , ['仿宋_GB2312', 'FangSong_GB2312']
  , ['楷体_GB2312', 'KaiTi_GB2312']
  , ['华文细黑', 'STHeiti Light [STXihei]']
  , ['华文黑体', 'STHeiti']
  , ['华文楷体', 'STKaiti']
  , ['华文宋体', 'STSong']
  , ['华文仿宋', 'STFangsong']
  , ['丽黑 Pro', 'LiHei Pro Medium']
  , ['丽宋 Pro', 'LiSong Pro Light']
  , ['苹果丽中黑', 'Apple LiGothic Medium']
  , ['苹果丽细宋', 'Apple LiSung Light']
  ]

  const fontFamilyToAliases: Map<string, string[]> = new Map(
    commonFontAliasPairs.flatMap(fontAliasPair => {
      return fontAliasPair.map(fontFamily => [fontFamily, fontAliasPair])
    })
  )

  return fontFamily => fontFamilyToAliases.get(fontFamily) ?? []
})
