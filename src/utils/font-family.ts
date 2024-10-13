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

export async function getFontFamilyAliases(fontFamily: string): Promise<string[]> {
  return [
    ...getFontFamilyAliasesFromPredefinedTables(fontFamily)
  , ...await getBrowserFontFamilyAliases(fontFamily)
  ]
}

/**
 * 从浏览器API处查找fontFamily的别名.
 */
async function getBrowserFontFamilyAliases(fontFamily: string): Promise<string[]> {
  const fontList = await getBrowserFontList()
  const fontName = fontList
    .find(({ displayName, fontId }) => {
      return displayName === fontFamily
          || fontId === fontFamily
    })

  if (fontName) {
    return [fontName.displayName, fontName.fontId]
  } else {
    return []
  }
}

/**
 * 从预定义的别名表里查找fontFamily的别名.
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
