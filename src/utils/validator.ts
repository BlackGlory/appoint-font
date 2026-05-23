import { isArray, isBoolean, isPlainObject, isString } from '@blackglory/prelude'
import { inEnum } from 'extra-utils'
import { IRule, FontType, Matcher, MatchType } from '@src/contract'

export function isRuleArray(val: unknown): val is IRule[] {
  return isArray(val)
      && val.every(isRule)
}

function isRule(val: unknown): val is IRule {
  return isPlainObject(val)
      && ('id' in val && isString(val.id))
      && ('enabled' in val && isBoolean(val.enabled))
      && ('fontType' in val && inEnum(val.fontType, FontType))
      && ('fontFamily' in val && isString(val.fontFamily))

      && ('matchersEnabled' in val && isBoolean(val.matchersEnabled))
      && ('matchers' in val && isArray(val.matchers) && val.matchers.every(isMatcher))

      && ('subFontFamilyEnabled' in val && isBoolean(val.subFontFamilyEnabled))
      && ('subFontFamily' in val && isString(val.subFontFamily))

      && ('fontWeightEnabled' in val && isBoolean(val.fontWeightEnabled))
      && ('fontWeight' in val && isString(val.fontWeight))

      && ('unicodeRangeEnabled' in val && isBoolean(val.unicodeRangeEnabled))
      && ('unicodeRange' in val && isString(val.unicodeRange))
}

function isMatcher(val: unknown): val is Matcher {
  return isPlainObject(val)
      && ('type' in val && inEnum(val.type, MatchType))
      && ('pattern' in val && isString(val.pattern))
}
