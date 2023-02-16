import { IFontList } from '@src/contract'
import { getBrowserFixedFontSize } from '@utils/font-settings'

export async function getFontLists(): Promise<Required<IFontList>> {
  const browserFontNames = await chrome.fontSettings.getFontList()
  const fontSize = await getBrowserFixedFontSize()
  const fontList: string[] = browserFontNames.map(x => x.fontId)
  const monospaceFontList: string[] = fontList
    .filter(fontFamily => isMonospace(fontFamily, fontSize))

  return {
    all: fontList
  , monospace: monospaceFontList
  }
}

function isMonospace(fontFamily: string, fontSize: number): boolean {
  const fixedWidthChars = 'ab'
  const variableWidthChars = 'il'

  return measureTextWidth(fontFamily, fontSize, fixedWidthChars)
     === measureTextWidth(fontFamily, fontSize, variableWidthChars)
}

function measureTextWidth(font: string, fontSize: number, text: string): number {
  const ctx = document
    .createElement('canvas')
    .getContext('2d')!

  ctx.font = `${fontSize}px ${font}`

  return ctx
    .measureText(text)
    .width
}
