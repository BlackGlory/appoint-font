import { useState, useMemo } from 'react'
import { useMount, useToggle } from 'extra-react-hooks'
import { Select } from '@components/select'
import { FontPreview } from '@components/font-preview'
import { go } from '@blackglory/prelude'
import { getFontLists } from '@utils/font-list'
import { createBackgroundClient } from '@delight-rpc/webextension'
import { IAPI, IRule, FontType } from '@src/contract'
import { nanoid } from 'nanoid'
import { Button } from '@components/button'
import { RemoveButton } from '@components/remove-button'
import { UpButton } from '@components/up-button'
import { DownButton } from '@components/down-button'
import { Toggle } from '@components/toggle'
import { useImmer } from 'use-immer'

export function Options() {
  const client = useMemo(() => createBackgroundClient<IAPI>(), [])
  const [allFontList, setAllFontList] = useState<string[]>([])
  const [monospaceFontList, setMonospaceFontList] = useState<string[]>([])
  const [rules, setRules] = useImmer<IRule[]>([])

  useMount(() => {
    go(async () => {
      const { all, monospace } = await getFontLists()

      setAllFontList(all)
      setMonospaceFontList(monospace)

      await client.setFontList({ all, monospace })

      const config = await client.getConfig()
      if (config.rules) {
        setRules(config.rules)
      }
    })
  })

  return (
    <div className='min-w-[500px] min-h-[500px]'>
      <nav className='bg-gray-50 px-4 py-2 border-y sticky top-0 flex justify-between'>
        <div className='space-x-2'>
          <Button
            onClick={() => setRules(rules => {
              rules.push({
                id: nanoid()
              , enabled: true
              , fontType: FontType.Standard
              })
            })}
          >
            添加规则
          </Button>
        </div>

        <div className='space-x-2'>
          <Button onClick={() => setRules([])}>
            清空规则
          </Button>
          <Button>
            导入规则
          </Button>
          <Button>
            导出规则
          </Button>
        </div>
      </nav>

      <ul className='py-2 px-4'>
        {rules.map((rule, i) => {
          return (
            <li key={rule.id} className='space-y-2 border-b py-2 last:border-b-0'>
              <div className='flex justify-between'>
                <div className='space-y-2'>
                  <section className='flex items-center'>
                    <label className='w-1/3'>规则类型</label>

                    <Select
                      items={[
                        { name: '替换标准字体', value: FontType.Standard }
                      , { name: '替换等宽字体', value: FontType.FixedWidth }
                      ]}
                      value={rule.fontType}
                      onChange={fontType => setRules(rules => {
                        rules[i].fontType = fontType
                      })}
                    />
                  </section>

                  <section className='flex items-center'>
                    <label className='w-1/3'>自定义字体</label>

                    <Select
                      items={
                        go(() => {
                          switch (rule.fontType) {
                            case FontType.Standard: return allFontList
                            case FontType.FixedWidth: return monospaceFontList
                            default: throw new Error('Unexpected route')
                          }
                        })
                          .map(x => ({ name: x, value: x }))
                      }
                      value={rule.fontFamily}
                      onChange={fontFamily => setRules(rules => {
                        rules[i].fontFamily = fontFamily
                      })}
                    />
                  </section>

                  <section className='flex items-center'>
                    <AdvancedOptions />
                  </section>
                </div>

                <aside className='space-x-2'>
                  <RemoveButton
                    onClick={() => setRules(rules => {
                      rules.splice(i, 1)
                    })}
                  />
                  <UpButton
                    onClick={() => setRules(rules => {
                      const previousRule = rules[i - 1]
                      if (previousRule) {
                        rules[i] = previousRule
                        rules[i - 1] = rule
                      }
                    })}
                  />
                  <DownButton
                    onClick={() => setRules(rules => {
                      const nextRule = rules[i + 1]
                      if (nextRule) {
                        rules[i] = nextRule
                        rules[i + 1] = rule
                      }
                    })}
                  />
                  <Toggle
                    value={rule.enabled}
                    onClick={value => setRules(rules => {
                      rules[i].enabled = value
                    })}
                  />
                </aside>
              </div>

              {rule.fontFamily && (
                <div className='space-y-2'>
                  <h3>预览</h3>
                  <FontPreview
                    fontFamily={rule.fontFamily}
                    initialFontSize={16}
                  >
                    <div className='rounded-md p-2 bg-gray-100'>
                      <p>我能吞下玻璃而不伤身体。</p>
                      <p>I can eat glass, it does not hurt me.</p>
                    </div>
                  </FontPreview>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AdvancedOptions() {
  const [toggled, setToggle] = useToggle(false)

  return (
    <div>
      <label className='inline-flex space-x-1'>
        <input
          className='border accent-gray-700'
          type='checkbox'
          checked={toggled}
          onClick={setToggle}
        />
        <span>高级选项</span>
      </label>
      <section>
        <label>页面匹配器(只有满足匹配条件的页面会应用此规则)</label>

        <label>Unicode范围匹配器(只有此Unicode范围内的字符会应用此规则)</label>
      </section>
    </div>
  )
}
