import { go, lazy, toArray } from '@blackglory/prelude'
import { IFontList, IRule, FontType } from '@src/contract'
import { createFontFaceRule } from '@utils/font-face'
import { getFontFamilyAliases, GenericFontFamily } from '@utils/font-family'
import { dedent } from 'extra-tags'
import { flatMap, uniq } from 'iterable-operator'

export async function convertRuleToCSS(
  rule: Pick<
    IRule
  , 'id'
  | 'fontType'
  | 'fontFamily'
  | 'fontWeightEnabled'
  | 'fontWeight'
  | 'subFontFamily'
  | 'subFontFamilyEnabled'
  | 'unicodeRangeEnabled'
  | 'unicodeRange'
  >
, fontList: IFontList
): Promise<string | undefined> {
  if (rule.fontFamily) {
    const allFonts = new Set<string>([
      ...fontList.all.map(font => font.fontId)
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
    ])
    const monospaceFonts = new Set<string>([
      ...fontList.monospace.map(font => font.fontId)
    , GenericFontFamily.Monospace
    , GenericFontFamily.UIMonospace
    ])

    const getLocalFonts = lazy(async () => {
      const ruleFontFamilyFonts = new Set([
        rule.fontFamily
      , ...await getFontFamilyAliases(rule.fontFamily)
      ])
      const ruleSubFontFamily = rule.subFontFamily.trim()

      return rule.subFontFamilyEnabled && ruleSubFontFamily
           ? [
               ...flatMap(ruleFontFamilyFonts, ruleFontFamilyFont => [
                 `${ruleFontFamilyFont} ${ruleSubFontFamily}`
               , `${ruleFontFamilyFont}-${ruleSubFontFamily}`
               ])
             , ...ruleFontFamilyFonts
             ]
           : toArray(ruleFontFamilyFonts)
    })

    const fontFaceRules: string[] = []
    for (const font of allFonts) {
      if (
        (
          rule.fontType === FontType.Standard &&
          !monospaceFonts.has(font)
        ) || (
          rule.fontType === FontType.FixedWidth &&
          monospaceFonts.has(font)
        )
      ) {
        for (
          const fontFamily of uniq([
            font
          , ...await getFontFamilyAliases(font)
          ])
        ) {
          fontFaceRules.push(
            createFontFaceRule(
              fontFamily
            , await getLocalFonts()
            , {
                ...rule.fontWeightEnabled && { fontWeight: rule.fontWeight }
              , ...rule.unicodeRangeEnabled && { unicodeRange: rule.unicodeRange }
              }
            )
          )
        }
      }
    }

    return dedent`
      /* Rule ID: ${rule.id} */
      ${fontFaceRules.join('\n')}
    `
  }
}
