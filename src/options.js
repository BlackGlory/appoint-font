'use strict'

import * as promise from 'extra-promise'
import { getFont, getMinimumFontSize, getFontList, get, set } from './utils'

const GenericFamily = [
  // Serif
  'serif'
, 'Times'
, 'Georgia'
, 'New Century Schoolbook'
  // Sans-serif
, 'sans-serif'
, 'Helvetica'
, 'Geneva'
, 'Verdana'
, 'Arial'
, 'Univers'
  // Monospace
, 'Monospace'
, 'Courier'
, 'Courier New Andale Mono'
  // Cursive
, 'Cursive'
, 'Zapf Chancery'
, 'Author'
, 'Comic Sans'
  // Fantasy
, 'Fantasy'
, 'Western'
, 'Woodblock'
, 'Klingon'
]

document.querySelectorAll('section').forEach(section => {
  const label = section.querySelector('label')
  label.textContent = chrome.i18n.getMessage(label.textContent)

  const select = section.querySelector('select')
  if (select) {
    select.addEventListener('change', async function() {
      const config = {
        ...((await get(null) || {}).config || {})
      , [this.parentElement.id]: this.value
      }
      await set({ config })
    })
  }
})

;(async () => {
  function unique(arr) {
    return arr.filter((val, i, arr) => arr.indexOf(val) === i)
  }

  function measureWidth(font, text) {
    let ctx = document.createElement('canvas').getContext('2d')
    ctx.font = `${ pixelSize }px ${ font }`
    return ctx.measureText(text).width
  }

  function removeWeight(font) {
    const MIXED_TEXT = '你们有一个好，全世界跑到什么地方，你们比其他的西方记者啊，跑得还快。但是呢，问来问去的问题啊，都 too simple（太肤浅），啊，sometimes naïve!（有时很幼稚）懂了没有啊？'

    let ctx = document.createElement('canvas').getContext('2d')

    ctx.font = ctx.font.replace(/\d+px/, `${ pixelSize }px`)
    const defaultWidth = ctx.measureText(MIXED_TEXT).width

    // ctx style will be reset
    ctx.canvas.width = defaultWidth
    ctx.canvas.height = pixelSize

    ctx.font = ctx.font.replace(/\d+px/, `${ pixelSize }px`)
    ctx.textBaseline = 'hanging'
    ctx.fillText(MIXED_TEXT, 0, 0)

    ctx.font = `${ pixelSize }px ${ font }`
    if (ctx.measureText(MIXED_TEXT).width !== defaultWidth) {
      return font
    }

    ctx.globalCompositeOperation = 'xor'
    ctx.fillText(MIXED_TEXT, 0, 0)

    try {
      let data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
      for (let i = data.length; i--;) {
        if (data[i] !== 0) {
          return font
        }
      }
    } catch (e) {
      console.log(e)
      return null
    }

    font = font.split(' ').slice(0, -1)
    if (font.length > 0) {
      return removeWeight(font.join(' '))
    }

    return null
  }

  function isDefaultFixedFont(font) {
    return font === DefaultFonts.Fixed
  }

  function isDefaultFont(font) {
    return Object.values(DefaultFonts).includes(font)
  }

  function isGenericFamily(font) {
    return ['sans-serif', 'Sans-serif', 'serif', 'Serif'].includes(font)
  }

  function isFixedWidth(font) {
    const ALWAYS_FIXED_WIDTH_TEXT = 'ab'
    const NOT_ALWAYS_FIXED_WIDTH_TEXT = 'il'
    return measureWidth(font, ALWAYS_FIXED_WIDTH_TEXT) === measureWidth(font, NOT_ALWAYS_FIXED_WIDTH_TEXT)
  }

  function isPureEnglishFont(font) {
    const NON_ENGLISH_TEXT = '无可奉告'
    return measureWidth(font, NON_ENGLISH_TEXT) === measureWidth(DefaultFonts.SansSerif, NON_ENGLISH_TEXT)
  }

  function isMonospace(font) {
    if ((isDefaultFont(font) && !isDefaultFixedFont(font)) || isGenericFamily(font)) {
      return false
    } else {
      return isFixedWidth(font) && isPureEnglishFont(font)
    }
  }

  const DefaultFonts = await promise.map(
    {
      Standard: 'standard'
    , SansSerif: 'sansserif'
    , Serif: 'serif'
    , Fixed: 'fixed'
    , Cursive: 'cursive'
    , Fantasy: 'fantasy'
    }
  , async genericFamily => {
      const { fontId } = await getFont({ genericFamily })
      return fontId
    }
  )

  const pixelSize = (await getMinimumFontSize()).pixelSize || 12

  const selectStandard = document.querySelector('#standard select')
  const selectFixedWidth = document.querySelector('#fixed_width select')

  const fontList = unique(
    Array.from(await getFontList())
    .map(x => x.fontId)
    .map(removeWeight)
    .filter(x => !!x)
    .concat(Object.values(DefaultFonts))
    .concat(GenericFamily)
  ).sort()

  const fontListStandard = fontList
  fontListStandard.forEach(font => selectStandard.add(new Option(font, font)))

  const fontListMonospace = fontList.filter(isMonospace)
  fontListMonospace.forEach(font => selectFixedWidth.add(new Option(font, font)))

  const storage = await get(null) || {}

  let config = storage.config || {}

  let standard = config['standard']
  if (typeof config['standard'] === 'undefined') {
    standard = fontListStandard.includes(DefaultFonts.Standard) ? DefaultFonts.Standard : 'serif'
    config['standard'] = standard
  }
  selectStandard.value = standard

  let fixedWidth = config['fixed_width']
  if (typeof config['fixed_width'] === 'undefined') {
    fixedWidth = fontListMonospace.includes(DefaultFonts.Fixed) ? DefaultFonts.Fixed : 'Monospace'
    config['fixed_width'] = fixedWidth
  }
  selectFixedWidth.value = fixedWidth

  set({
    config
  , fontList: {
      'standard_fonts': fontListStandard
    , 'monospace_fonts': fontListMonospace
    , 'default_fonts': unique(Object.values(DefaultFonts))
    }
  })
})()
