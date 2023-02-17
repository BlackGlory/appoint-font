import { isArray, isBoolean, isObject, isString } from '@blackglory/prelude'
import { inEnum } from 'extra-utils'
import { IRule, FontType, Matcher, MatchType } from '@src/contract'

export function isRuleArray(val: unknown): val is IRule[] {
  return isArray(val)
      && val.every(isRule)
}

function isRule(val: unknown): val is IRule {
  return isObject(val)
      && ('id' in val && isString(val.id))
      && ('enabled' in val && isBoolean(val.enabled))
      && ('fontType' in val && inEnum(val.fontType, FontType))
      && ('fontFamily' in val && isString(val.fontFamily))
      && ('matchers' in val && isArray(val.matchers) && val.matchers.every(isMatcher))
      && ('matchersEnabled' in val && isBoolean(val.matchersEnabled))
      && ('fontWeight' in val && isString(val.fontWeight))
      && ('fontWeightEnabled' in val && isBoolean(val.fontWeightEnabled))
      && ('unicodeRange' in val && isString(val.unicodeRange))
      && ('unicodeRangeEnabled' in val && isBoolean(val.unicodeRangeEnabled))
}

function isMatcher(val: unknown): val is Matcher {
  return isObject(val)
      && ('type' in val && inEnum(val.type, MatchType))
      && ('pattern' in val && isString(val.pattern))
}
