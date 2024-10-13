import { dedent } from 'extra-tags'

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
    .map(font => `local("${font}")`) // 添加引号以防止字体名中带有`(`, `)`这样可能破坏CSS解析器的字符
    .join(', ')

  return dedent`
    @font-face {
      font-family: "${fontFamily}";
      src: ${fontSource};
      ${fontWeightDescriptor}
      ${unicodeRangeDescriptor}
    }
  `
}
