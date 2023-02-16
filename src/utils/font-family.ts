import { toArray } from '@blackglory/prelude'

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

export async function getFontFamilyAliases(fontFamily: string): Promise<string[]> {
  const aliases = new Set<string>()

  getFontFamilyAliasesFromPredefinedTables(fontFamily)
    .forEach(alias => aliases.add(alias))

  ;(await getFontFamilyAliasesFromAPI(fontFamily))
    .forEach(alias => aliases.add(alias))

  return toArray(aliases)
}

/**
 * 从浏览器API处查找fontFamily的别名, **结果可能包含重复项**.
 * 
 * @returns 返回包括fontFamily自己在内的别名数组.
 * 例如, 在参数为`微软雅黑`的情况下, 视运行环境而定, 此函数可能会返回`微软雅黑`和`Microsoft YaHei`.
 */
async function getFontFamilyAliasesFromAPI(
  fontFamily: string
): Promise<string[]> {
  const fontList = await chrome.fontSettings.getFontList()
  const fontName = fontList
    .find(({ displayName, fontId }) => {
      return displayName === fontFamily
          || fontId === fontFamily
    })

  if (fontName) {
    return [fontName.displayName, fontName.fontId]
  } else {
    return [fontFamily]
  }
}

/**
 * 从预定义的别名表里查找fontFamily的别名, **结果可能包含重复项**.
 * 
 * @returns 返回包括fontFamily自己在内的别名数组.
 * 例如, 在参数为`微软雅黑`的情况下, 视运行环境而定, 此函数可能会返回`微软雅黑`和`Microsoft YaHei`.
 */
function getFontFamilyAliasesFromPredefinedTables(fontFamily: string): string[] {
  const fontFamilyAliasTable = [
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

  const results: string[] = []
  for (const fontFamilyAliasRow of fontFamilyAliasTable) {
    if (fontFamilyAliasRow.includes(fontFamily)) {
      fontFamilyAliasRow.forEach(x => results.push(x))
    }
  }
  return results
}
