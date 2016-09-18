'use strict'

let FontAlias = {
  '宋体': 'SimSun'
, '黑体': 'SimHei'
, '微软雅黑': 'Microsoft YaHei'
, '微软正黑体': 'Microsoft JhengHei'
, '新宋体': 'NSimSun'
, '细明体': 'MingLiU'
, '标楷体': 'DFKai-SB'
, '仿宋': 'FangSong'
, '楷体': 'KaiTi'
, '仿宋_GB2312': 'FangSong_GB2312'
, '楷体_GB2312': 'KaiTi_GB2312'
, '华文细黑': 'STHeiti Light [STXihei]'
, '华文黑体': 'STHeiti'
, '华文楷体': 'STKaiti'
, '华文宋体': 'STSong'
, '华文仿宋': 'STFangsong'
, '丽黑 Pro': 'LiHei Pro Medium'
, '丽宋 Pro': 'LiSong Pro Light'
, '标楷体': 'BiauKai'
, '苹果丽中黑': 'Apple LiGothic Medium'
, '苹果丽细宋': 'Apple LiSung Light'
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(null, ({ config }) => {
    if (!config || !config['standard'] || !config['fixed_width']) {
      chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id })
    }
  })
})

chrome.fontSettings.getMinimumFontSize(({ pixelSize }) => {
  function createFontFaceDirective(family, ...fonts) {
    fonts = fonts.map(font => `local(${ font })`).join(', ')
    return `@font-face { font-family: ${ family }; src: ${ fonts }; }\n`
  }

  function createStyle({ standard_fonts = [], monospace_fonts = [], default_fonts = [] }, config = { 'standard': 'Serif', 'fixed_width': 'Monospace'}) {
    function createFontFaceDirectives(font) {
      let result = ''

      if (default_fonts.includes(font)) {
        result += createFontFaceDirective(font, config['standard'], config['fixed_width'])
      } else if (monospace_fonts.includes(font)) {
        result += createFontFaceDirective(font, config['fixed_width'], config['standard'])
      } else {
        result += createFontFaceDirective(font, config['standard'])
      }

      if (FontAlias[font]) {
        if (default_fonts.includes(font)) {
          result += createFontFaceDirective(FontAlias[font], config['standard'], config['fixed_width'])
        } else if (monospace_fonts.includes(font)) {
          result += createFontFaceDirective(FontAlias[font], config['fixed_width'], config['standard'])
        } else {
          result += createFontFaceDirective(FontAlias[font], config['standard'])
        }
      }

      return result
    }

    return standard_fonts.reduce((result, font) => {
      let isFixed = monospace_fonts.includes(font)
        , isDefault = default_fonts.includes(font)

      if (font !== config['standard'] && FontAlias[font] !== config['standard']
      && font !== config['fixed_width'] && FontAlias[font] !== config['fixed_width']) {
        result += createFontFaceDirectives(font)
      }

      return result
    }, '')
  }

  chrome.storage.local.get(null, ({ fontList = {}, config = {}}) => {
    let style = createStyle(fontList, config)
    console.log(style)

    chrome.storage.onChanged.addListener((changes, areaName) => {
      chrome.storage.local.get(null, ({ fontList = {}, config = {}}) => {
        style = createStyle(fontList, config)
        console.log(style)
      })
    })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') {
        chrome.tabs.insertCSS(tabId, {
          code: style
        , runAt: 'document_start'
        }, result => chrome.runtime.lastError && console.debug(chrome.runtime.lastError))
      }
    })
  })
})
