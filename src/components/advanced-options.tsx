import { IConfigStore, IRule } from '@src/contract'
import { Checkbox } from '@components/checkbox'
import { Expandable } from '@components/expandable'
import { Updater } from 'use-immer'
import { NewTabLink } from '@components/new-tab-link'
import { TextInput } from '@components/text-input'
import { MatcherOptions } from '@components/matcher-options'
import { i18n } from '@utils/i18n'

interface IAdvancedOptionsProps {
  rule: IRule
  ruleIndex: number

  setConfig: Updater<IConfigStore>
}

export function AdvancedOptions({ setConfig, rule, ruleIndex }: IAdvancedOptionsProps) {
  return (
    <div className='bg-gray-100 p-1'>
      <Expandable label={i18n('labelAdvancedOptions')}>
        <div className='space-y-2 p-1'>
          <section>
            <Checkbox
              value={rule.matchersEnabled}
              onClick={enabled => setConfig(config => {
                config.rules![ruleIndex].matchersEnabled = enabled
              })}
            >
              {i18n('labelMatchers')}
            </Checkbox>

            <MatcherOptions
              rule={rule}
              ruleIndex={ruleIndex}

              setConfig={setConfig}
            />
          </section>

          <section>
            <Checkbox
              value={rule.fontWeightEnabled}
              onClick={enabled => setConfig(config => {
                config.rules![ruleIndex].fontWeightEnabled = enabled
              })}
            >
              {i18n('labelLimitCustomFontPrefix')}<NewTabLink href='https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight'>{i18n('labelFontWeight')}</NewTabLink>
            </Checkbox>

            <TextInput
              disabled={!rule.fontWeightEnabled}
              value={rule.fontWeight}
              onChange={e => setConfig(config => {
                config.rules![ruleIndex].fontWeight = e.target.value
              })}
            />
          </section>

          <section>
            <Checkbox
              value={rule.unicodeRangeEnabled}
              onClick={enabled => setConfig(config => {
                config.rules![ruleIndex].unicodeRangeEnabled = enabled
              })}
            >
              {i18n('labelLimitCustomFontPrefix')}<NewTabLink href='https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range'>{i18n('labelUnicodeRange')}</NewTabLink>
            </Checkbox>

            <TextInput
              disabled={!rule.unicodeRangeEnabled}
              value={rule.unicodeRange}
              onChange={e => setConfig(config => {
                config.rules![ruleIndex].unicodeRange = e.target.value
              })}
            />
          </section>
        </div>
      </Expandable>
    </div>
  )
}
