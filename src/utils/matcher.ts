import { isMatch } from 'micromatch'
import { MatchType, Matcher } from '@src/contract'

export function matchRuleMatcher(url: string, matcher: Matcher): boolean {
  switch (matcher.type) {
    case MatchType.URL: {
      return matchURLPattern(url, matcher.pattern)
    }
    case MatchType.Host: {
      return matchHostPattern(url, matcher.pattern)
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
