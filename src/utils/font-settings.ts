import { lazy } from 'extra-lazy'

/**
 * 取自`chrome.fontSettings.GenericFamily`
 */
enum GenericFamily {
  // standard是由Chrome的API提供的, 由浏览器设置决定的字体族, 实际测试发现相当于CSS里的initial值.
  Standard = 'standard'
  // fixed是由Chrome的API提供的, 由浏览器设置决定的字体族, 实际测试发现相当于CSS里的monospace.
, Fixed = 'fixed'
  // 衬线体
, Serif = 'serif'
  // 非衬线体
, SansSerif = 'sansserif'
  // 花体, 草书字体
, Cursive = 'cursive'
  // 装饰性字体
, Fantasy = 'fantasy'
}

export const getBrowserFontList = lazy(() => chrome.fontSettings.getFontList())

export function getBrowserStandardFontFamily(): Promise<
  chrome.fontSettings.FontName | undefined
> {
  return getBrowserGenericFamily(GenericFamily.Standard)
}

export function getBrowserFixedFontFamily(): Promise<
  chrome.fontSettings.FontName | undefined
> {
  return getBrowserGenericFamily(GenericFamily.Fixed)
}

async function getBrowserGenericFamily(
  genericFamily: GenericFamily
): Promise<chrome.fontSettings.FontName | undefined> {
  const { fontId } = await chrome.fontSettings.getFont({ genericFamily })

  const fontList = await getBrowserFontList()
  const font = fontList.find(x => x.fontId === fontId)

  return font
}

export async function getBrowserDefaultFontSize(): Promise<number> {
  const { pixelSize } = await chrome.fontSettings.getDefaultFontSize()
  return pixelSize
}

export async function getBrowserMinimumFontSize(): Promise<number> {
  const { pixelSize } = await chrome.fontSettings.getMinimumFontSize()
  return pixelSize
}

/**
 * 不知道为什么Chrome专门给等宽字体的大小也提供了API.
 */
export async function getBrowserFixedFontSize(): Promise<number> {
  const { pixelSize } = await chrome.fontSettings.getDefaultFixedFontSize()
  return pixelSize
}
