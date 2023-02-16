import { isMatch } from 'micromatch'
import { MatchType, Matcher } from '@src/contract'

export function matchRuleMatcher(url: string, matcher: Matcher): boolean {
  switch (matcher.type) {
    case MatchType.URL: {
      return matcher.patterns.some(pattern => matchURLPattern(url, pattern))
    }
    case MatchType.Host: {
      return matcher.patterns.some(pattern => matchHostPattern(url, pattern))
    }
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
