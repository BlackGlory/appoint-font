import { go, toArray } from '@blackglory/prelude'
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
          const localFonts: string[] = await go(async () => {
            const localFonts = new Set([
              rule.fontFamily
            , ...await getFontFamilyAliases(rule.fontFamily)
            ])

            if (rule.subFontFamilyEnabled) {
              const subFontFamily = rule.subFontFamily.trim()

              if (subFontFamily) {
                return [
                  ...flatMap(localFonts, localFont => [
                    `${localFont} ${subFontFamily}`
                  , `${localFont}-${subFontFamily}`
                  ])
                , ...localFonts
                ]
              } else {
                return toArray(localFonts)
              }
            } else {
              return toArray(localFonts)
            }
          })

          fontFaceRules.push(
            createFontFaceRule(
              fontFamily
            , localFonts
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
