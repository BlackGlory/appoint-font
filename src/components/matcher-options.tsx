import { IRule, MatchType } from '@src/contract'
import { Select } from '@components/select'
import { Button } from '@components/button'
import { RemoveButton } from '@components/remove-button'
import { TextInput } from '@components/text-input'
import { i18n } from '@utils/i18n'
import { ConfigStoreContext } from '@utils/config-store'
import { useUpdater } from 'extra-react-store'

interface IMatcherOptionsProps {
  rule: IRule
  ruleIndex: number
}

export function MatcherOptions({ rule, ruleIndex }: IMatcherOptionsProps) {
  const updateConfig = useUpdater(ConfigStoreContext)

  return (
    <div className='space-y-2'>
      <Button
        className='w-full'
        onClick={() => updateConfig(config => {
          config.rules![ruleIndex].matchers.push({
            type: MatchType.Host
          , pattern: ''
          })
        })}
      >
        {i18n('buttonCreateCondition')}
      </Button>

      <ul className='space-y-2'>
        {rule.matchers.map((matcher, i) => (
          <li key={i} className='space-y-0.5'>
            <div className='flex items-center space-x-2'>
              <label>{i18n('buttonConditionType')}</label>

              <Select
                items={[
                  { name: i18n('selectMatchHost'), value: MatchType.Host }
                , { name: i18n('selectMatchURL'), value: MatchType.URL }
                ]}
                value={matcher.type}
                onChange={type => updateConfig(config => {
                  config.rules![ruleIndex].matchers[i].type = type
                })}
              />

              <RemoveButton onClick={() => updateConfig(config => {
                config.rules![ruleIndex].matchers.splice(i, 1)
              })} />
            </div>

            <div className='flex'>
              <TextInput
                value={matcher.pattern}
                onChange={e => updateConfig(config => {
                  config.rules![ruleIndex].matchers[i].pattern = e.target.value
                })}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
