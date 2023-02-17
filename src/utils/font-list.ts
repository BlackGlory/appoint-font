import { IFontListStore } from '@src/contract'
import { getBrowserFixedFontSize } from '@utils/font-settings'
import { assert } from '@blackglory/prelude'

export async function generateFontLists(): Promise<IFontListStore> {
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
  const ctx = new OffscreenCanvas(1000, 1000).getContext('2d')
  assert(ctx, 'The ctx is null')

  ctx.font = `${fontSize}px ${font}`

  return ctx
    .measureText(text)
    .width
}
