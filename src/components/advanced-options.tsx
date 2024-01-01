import { IRule } from '@src/contract'
import { Checkbox } from '@components/checkbox'
import { Collapsible } from '@components/collapsible'
import { NewTabLink } from '@components/new-tab-link'
import { TextInput } from '@components/text-input'
import { MatcherOptions } from '@components/matcher-options'
import { i18n } from '@utils/i18n'
import { ConfigStoreContext } from '@utils/config-store'
import { useUpdater } from 'extra-react-store'

interface IAdvancedOptionsProps {
  rule: IRule
  ruleIndex: number
}

export function AdvancedOptions({ rule, ruleIndex }: IAdvancedOptionsProps) {
  const updateConfig = useUpdater(ConfigStoreContext)

  return (
    <div className='bg-gray-100 p-1'>
      <Collapsible label={i18n('labelAdvancedOptions')} defaultOpen={false}>
        <div className='space-y-2 p-1'>
          <section>
            <Checkbox
              value={rule.matchersEnabled}
              onChange={enabled => updateConfig(config => {
                config.rules![ruleIndex].matchersEnabled = enabled
              })}
            >
              {i18n('labelMatchers')}
            </Checkbox>

            <MatcherOptions
              rule={rule}
              ruleIndex={ruleIndex}
            />
          </section>

          <section>
            <Checkbox
              value={rule.fontWeightEnabled}
              onChange={enabled => updateConfig(config => {
                config.rules![ruleIndex].fontWeightEnabled = enabled
              })}
            >
              {i18n('labelLimitCustomFontPrefix')}<NewTabLink href='https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-weight'>{i18n('labelFontWeight')}</NewTabLink>
            </Checkbox>

            <TextInput
              disabled={!rule.fontWeightEnabled}
              value={rule.fontWeight}
              onChange={e => updateConfig(config => {
                config.rules![ruleIndex].fontWeight = e.target.value
              })}
            />
          </section>

          <section>
            <Checkbox
              value={rule.unicodeRangeEnabled}
              onChange={enabled => updateConfig(config => {
                config.rules![ruleIndex].unicodeRangeEnabled = enabled
              })}
            >
              {i18n('labelLimitCustomFontPrefix')}<NewTabLink href='https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range'>{i18n('labelUnicodeRange')}</NewTabLink>
            </Checkbox>

            <TextInput
              disabled={!rule.unicodeRangeEnabled}
              value={rule.unicodeRange}
              onChange={e => updateConfig(config => {
                config.rules![ruleIndex].unicodeRange = e.target.value
              })}
            />
          </section>
        </div>
      </Collapsible>
    </div>
  )
}
