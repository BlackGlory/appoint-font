export function i18n(messageName: string): string {
  return chrome.i18n.getMessage(messageName)
}
