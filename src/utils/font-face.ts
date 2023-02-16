import { dedent } from 'extra-tags'
import { isNumber, isString } from '@blackglory/prelude'

// @font-face的字重允许1~2个值.
type FontFaceFontWeight = 
| string | number // 表示在此字重下使用.
| [string | number, string | number] // 表示在此字重范围内使用.

function convertFontFacefontWeightToCSSString(fontWeight: FontFaceFontWeight): string {
  if (isString(fontWeight)) {
    return fontWeight
  } else if (isNumber(fontWeight)) {
    return `${fontWeight}`
  } else {
    return fontWeight
      .map(convertFontFacefontWeightToCSSString)
      .join(' ')
  }
}

/**
 * 创建CSS FontFace规则.
 */
export function createFontFaceRule(
  fontFamily: string
, localFonts: string[]
, { fontWeight, unicodeRange }: {
    unicodeRange?: string
    fontWeight?: FontFaceFontWeight
  } = {}
): string {
  const unicodeRangeDescriptor = unicodeRange
    ? `unicode-range: ${unicodeRange};`
    : ''
  const fontWeightDescriptor = fontWeight
    ? `font-weight: ${convertFontFacefontWeightToCSSString(fontWeight)};`
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
