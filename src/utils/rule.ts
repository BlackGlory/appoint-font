import { isMatch } from 'micromatch'

export enum FontType {
  Standard
, FixedWidth
}

export enum MatchType {
  URL
, Host
}

export enum Language {
  Chinese
, SimplifiedChinese
, TraditionalChinese
, English
}

export interface IRule {
  id: string
  enabled: boolean
  fontType: FontType
  fontFamily?: string
  matcher?: Matcher
  fontWeight?: string
  unicodeRange?: string
}

type Matcher =
| IURLMatcher
| IHostMatcher

interface IURLMatcher {
  type: MatchType.URL
  pattern: string
}

interface IHostMatcher {
  type: MatchType.Host
  pattern: string
}

export function matchRuleMatcher(url: string, matcher: Matcher): boolean {
  switch (matcher.type) {
    case MatchType.URL: return matchURLPattern(url, matcher.pattern)
    case MatchType.Host: return matchHostPattern(url, matcher.pattern)
    default: throw new Error('Unexpected route')
  }
}

function matchURLPattern(url: string, pattern: string): boolean {
  return isMatch(url, pattern, { bash: true })
}

function matchHostPattern(url: string, pattern: string): boolean {
  const urlObj = new URL(url)
  const host = urlObj.host

  return isMatch(host, pattern, { bash: true })
}
