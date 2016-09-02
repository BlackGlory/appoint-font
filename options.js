'use strict'

const MIXED_TEXT = '你们有一个好，全世界跑到什么地方，你们比其他的西方记者啊，跑得还快。但是呢，问来问去的问题啊，都 too simple（太肤浅），啊，sometimes naïve!（有时很幼稚）懂了没有啊？'
const NON_ENGLISH_TEXT = '无可奉告'
const MONO_TEST_TEXT1 = 'ab'
const MONO_TEST_TEXT2 = 'il'

let GenericFamily = [
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

function unique(arr) {
  return arr.filter((val, i, arr) => arr.indexOf(val) === i)
}

chrome.fontSettings.getFont({ genericFamily: 'standard' }, ({ fontId: defaultStandard }) =>
chrome.fontSettings.getFont({ genericFamily: 'sansserif' }, ({ fontId: defaultSansSerif }) =>
chrome.fontSettings.getFont({ genericFamily: 'serif' }, ({ fontId: defaultSerif }) =>
chrome.fontSettings.getFont({ genericFamily: 'fixed' }, ({ fontId: defaultFixed }) =>
chrome.fontSettings.getFont({ genericFamily: 'cursive' }, ({ fontId: defaultCursive }) =>
chrome.fontSettings.getFont({ genericFamily: 'fantasy' }, ({ fontId: defaultFantasy }) =>
  chrome.fontSettings.getMinimumFontSize(({ pixelSize }) => {
    const DefaultFonts = [defaultStandard, defaultSansSerif, defaultSerif, defaultFixed, defaultCursive, defaultFantasy]

    function removeWeight(font) {
      let ctx = document.createElement('canvas').getContext('2d')
        , defaultFont = ctx.font.replace(/\d+px/, `${ pixelSize }px`)
        , defaultWidth = ctx.measureText(MIXED_TEXT).width

      ctx.textBaseline = 'top'
      ctx.width = defaultWidth
      ctx.height = pixelSize
      ctx.fillText(MIXED_TEXT, 0, 0)

      ctx.font = `${ pixelSize }px ${ font }`
      if (ctx.measureText(MIXED_TEXT).width !== defaultWidth) {
        return font
      }

      ctx.globalCompositeOperation = 'xor'
      ctx.fillText(MIXED_TEXT, 0, 0)
      let data = ctx.getImageData(0, 0, ctx.width, ctx.height)
      for (let i = data.length; i--;) {
        if (data[i] !== 0) {
          return font
        }
      }

      font = font.split(' ').slice(0, -1)
      if (font.length > 0) {
        return removeWeight(font.join(' '))
      }

      return null
    }

    function isMonospace(font) {
      function measureWidth(font, text) {
        let ctx = document.createElement('canvas').getContext('2d')
        ctx.font = `${ pixelSize }px ${ font }`
        return ctx.measureText(text).width
      }

      if (font === defaultFixed) {
        return true
      } else if (DefaultFonts.includes(font) || ['Sans-serif', 'Serif'].includes(font)) {
        return false
      }

      return measureWidth(font, MONO_TEST_TEXT1) === measureWidth(font, MONO_TEST_TEXT2)
      && measureWidth(font, NON_ENGLISH_TEXT) === measureWidth(defaultSansSerif, NON_ENGLISH_TEXT)
    }

    chrome.fontSettings.getFontList(fontList => {
      let selectStandard = document.querySelector('select#standard')
        , selectFixedWidth = document.querySelector('select#fixed_width')

      fontList = unique(
        Array
        .from(fontList)
        .map(x => x.fontId)
        .map(removeWeight)
        .filter(x => !!x)
        .concat(DefaultFonts)
        .concat(GenericFamily)
      )

      let fontListStandard = fontList
        , fontListMonospace = fontList.filter(isMonospace)

      fontListStandard.forEach(font => selectStandard.add(new Option(font, font)))
      fontListMonospace.forEach(font => selectFixedWidth.add(new Option(font, font)))

      chrome.storage.local.get(null, ({ config = {} }) => {
        if (config['standard']) {
          document.querySelector('#standard').value = config['standard']
        } else {
          document.querySelector('#standard').value = fontListStandard.includes(defaultStandard) ? defaultStandard : 'serif'
        }

        if (config['fixed_width']) {
          document.querySelector('#fixed_width').value = config['fixed_width']
        } else {
          document.querySelector('#fixed_width').value = fontListMonospace.includes(defaultFixed) ? defaultFixed : 'Monospace'
        }
      })

      chrome.storage.local.set({
        fontList: {
          'standard_fonts': fontListStandard
        , 'monospace_fonts': fontListMonospace
        , 'default_fonts': DefaultFonts
        }
      })
    })

    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', function() {
        chrome.storage.local.get(null, storage => {
          chrome.storage.local.set({ config: Object.assign(storage.config || {}, { [this.id]: this.value })})
        })
      })
    })
  })
))))))
