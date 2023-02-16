import { IConfigStore, IRule } from '@src/contract'
import { Checkbox } from '@components/checkbox'
import { Expandable } from '@components/expandable'
import { Updater } from 'use-immer'
import { NewTabLink } from '@components/new-tab-link'
import { TextInput } from '@components/text-input'
import { MatcherOptions } from '@components/matcher-options'

interface IAdvancedOptionsProps {
  rule: IRule
  ruleIndex: number

  setConfig: Updater<IConfigStore>
}

export function AdvancedOptions({ setConfig, rule, ruleIndex }: IAdvancedOptionsProps) {
  return (
    <div className='bg-gray-100 p-1'>
      <Expandable label='高级选项'>
        <div className='space-y-2 p-1'>
          <section>
            <Checkbox
              value={rule.matchersEnabled}
              onClick={enabled => setConfig(config => {
                config.rules![ruleIndex].matchersEnabled = enabled
              })}
            >
              仅在至少满足以下一个条件的页面里应用此规则
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
              限制自定义字体的<NewTabLink href='https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight'>字重</NewTabLink>
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
              限制自定义字体的<NewTabLink href='https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range'>Unicode范围</NewTabLink>
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
