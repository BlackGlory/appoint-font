import { IFontList } from '@src/contract'
import { getBrowserFixedFontSize } from '@utils/font-settings'
import { assert } from '@blackglory/prelude'
import { getBrowserFontList } from '@utils/font-settings'
import { lazy } from 'extra-lazy'

export const generateFontLists = lazy(async (): Promise<IFontList> => {
  const browserFontNames = await getBrowserFontList()
  const fontSize = await getBrowserFixedFontSize()
  const monospaceFontList = browserFontNames
    .filter(fontName => isMonospace(fontName.fontId, fontSize))

  return {
    all: browserFontNames
  , monospace: monospaceFontList
  }
})

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
