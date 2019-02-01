import * as promise from 'extra-promise'

function chromePromisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, function(...args) {
        const err = chrome.runtime.lastError
        if (err) {
          return reject(err)
        }
        return resolve(...args)
      })
    })
  }
}

export const getFont = chromePromisify(chrome.fontSettings.getFont)
export const getMinimumFontSize = chromePromisify(chrome.fontSettings.getMinimumFontSize)
export const getFontList = chromePromisify(chrome.fontSettings.getFontList)
export const get = chromePromisify((...args) => chrome.storage.local.get(...args))
export const set = chromePromisify((...args) => chrome.storage.local.set(...args))
export const insertCSS = promise.warn(chromePromisify(chrome.tabs.insertCSS))
export const executeScript = promise.warn(chromePromisify(chrome.tabs.executeScript))
export const getAllFrames = chromePromisify(chrome.webNavigation.getAllFrames)
