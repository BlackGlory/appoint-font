import { IFontList } from '@src/contract'
import { assert } from '@blackglory/prelude'
import { getBrowserFontList } from '@utils/font-settings'
import { lazy } from 'extra-lazy'

const getCanvasContext = lazy(() => {
  const ctx = new OffscreenCanvas(100, 100).getContext('2d')
  assert(ctx, 'The ctx is null')

  return ctx
})

export const generateFontLists = lazy(async (): Promise<IFontList> => {
  const browserFontNames = await getBrowserFontList()
  const monospaceFontList = browserFontNames
    .filter(fontName => isMonospace(fontName.fontId))

  return {
    all: browserFontNames
  , monospace: monospaceFontList
  }
})

function isMonospace(fontFamily: string, fontSize: number = 16): boolean {
  const fixedWidthChars = 'ab'
  const variableWidthChars = 'il'

  return measureTextWidth(fontFamily, fontSize, fixedWidthChars)
     === measureTextWidth(fontFamily, fontSize, variableWidthChars)
}

function measureTextWidth(font: string, fontSize: number, text: string): number {
  const ctx = getCanvasContext()

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.font = `${fontSize}px ${font}`

  return ctx
    .measureText(text)
    .width
}
