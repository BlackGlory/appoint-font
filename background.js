'use strict'

const FontAlias = {
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

chrome.fontSettings.getMinimumFontSize(({ pixelSize }) => {
  function createFontFace(family, ...fonts) {
    fonts = fonts.map(font => `local(${ font })`).join(', ')
    return `@font-face { font-family: ${ family }; src: ${ fonts }; }`
  }

  function createStyle({ standard = [], monospace =[] }, config = {}) {
    return standard.reduce((result, font) => {
      let fontType = monospace.indexOf(font) !== -1 ? 'fixed_width' : 'standard'
        , appointFont = config[fontType]

      if (font !== appointFont && FontAlias[font] !== appointFont) {
        if (FontAlias[font]) {
          if (fontType === 'fixed_width') {
            result +=  createFontFace(FontAlias[font], appointFont, config['standard'], FontAlias[font]) + '\n'
          } else {
            result +=  createFontFace(FontAlias[font], appointFont, FontAlias[font]) + '\n'
          }
        }

        if (fontType === 'fixed_width') {
          result += createFontFace(font, appointFont, config['standard'], font) + '\n'
        } else {
          result += createFontFace(font, appointFont, font) + '\n'
        }
      }

      return result
    }, '')
  }

  chrome.storage.local.get(null, ({ fontList = [], config = {}}) => {
    let style = createStyle(fontList, config)

    chrome.storage.onChanged.addListener((changes, areaName) => {
      chrome.storage.local.get(null, ({ fontList, config }) => style = createStyle(fontList, config))
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

chrome.runtime.onInstalled.addListener(() => chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id }))
