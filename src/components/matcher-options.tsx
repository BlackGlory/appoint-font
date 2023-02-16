import { IConfigStore, IRule, MatchType } from '@src/contract'
import { Updater } from 'use-immer'
import { Select } from '@components/select'
import { Button } from '@components/button'
import { RemoveButton } from '@components/remove-button'
import { TextInput } from '@components/text-input'

interface IMatcherOptionsProps {
  rule: IRule
  ruleIndex: number

  setConfig: Updater<IConfigStore>
}

export function MatcherOptions({
  setConfig
, rule
, ruleIndex
}: IMatcherOptionsProps) {
  return (
    <div className='space-y-2'>
      <Button
        className='w-full'
        onClick={() => setConfig(config => {
          config.rules![ruleIndex].matchers.push({
            type: MatchType.Host
          , pattern: ''
          })
        })}
      >
        添加条件
      </Button>

      <ul className='space-y-2'>
        {rule.matchers.map((matcher, i) => (
          <li className='space-y-0.5'>
            <div className='flex items-center space-x-2'>
              <label>条件类型</label>

              <Select
                items={[
                  { name: '匹配主机名（可使用通配符）', value: MatchType.Host }
                , { name: '匹配URL（可使用通配符）', value: MatchType.URL }
                ]}
                value={matcher.type}
                onChange={type => setConfig(config => {
                  config.rules![ruleIndex].matchers[i].type = type
                })}
              />

              <RemoveButton onClick={() => setConfig(config => {
                config.rules![ruleIndex].matchers.splice(i, 1)
              })} />
            </div>

            <div className='flex'>
              <TextInput
                value={matcher.pattern}
                onChange={e => setConfig(config => {
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
