import { dedent } from 'extra-tags'
import { isNumber, isString } from '@blackglory/prelude'

/**
 * 创建CSS FontFace规则.
 */
export function createFontFaceRule(
  fontFamily: string
, localFonts: string[]
, { fontWeight, unicodeRange }: {
    unicodeRange?: string
    fontWeight?: string
  } = {}
): string {
  const unicodeRangeDescriptor = unicodeRange
    ? `unicode-range: ${unicodeRange};`
    : ''
  const fontWeightDescriptor = fontWeight
    ? `font-weight: ${fontWeight};`
    : ''

  const fontSource = localFonts
    .map(font => `local(${ font })`)
    .join(', ')

  return dedent`
    @font-face {
      font-family: ${ fontFamily };
      src: ${ fontSource };
      font-synthesis: none;
      ${fontWeightDescriptor}
      ${unicodeRangeDescriptor}
    }
  `
}
