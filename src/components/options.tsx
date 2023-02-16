import { useState, useMemo } from 'react'
import { useMount } from 'extra-react-hooks'
import { Select } from '@components/select'
import { go } from '@blackglory/prelude'
import { getFontLists } from '@utils/font-list'
import { createBackgroundClient } from '@delight-rpc/webextension'
import { IAPI, FontType } from '@src/contract'
import { nanoid } from 'nanoid'
import { Button } from '@components/button'
import { RemoveButton } from '@components/remove-button'
import { UpButton } from '@components/up-button'
import { DownButton } from '@components/down-button'
import { Switch } from '@components/switch'
import { AdvancedOptions } from '@components/advanced-options'
import { useConfig } from '@hooks/use-config'
import { i18n } from '@utils/i18n'

export function Options() {
  const client = useMemo(() => createBackgroundClient<IAPI>(), [])
  const [allFontList, setAllFontList] = useState<string[]>([])
  const [monospaceFontList, setMonospaceFontList] = useState<string[]>([])
  const [config, setConfig] = useConfig(client)

  useMount(() => {
    go(async () => {
      const { all, monospace } = await getFontLists()

      setAllFontList(all)
      setMonospaceFontList(monospace)

      await client.setFontList({ all, monospace })
    })
  })

  return (
    <div className='min-w-[500px] min-h-[500px]'>
      <nav className='bg-gray-50 px-4 py-2 border-y sticky top-0 flex justify-between'>
        <div className='space-x-2'>
          <Button onClick={() => setConfig(config => {
            if (!config.rules) {
              config.rules = []
            }

            config.rules.push({
              id: nanoid()
            , enabled: true
            , fontType: FontType.Standard
            , fontFamily: ''

            , matchersEnabled: false
            , matchers: []

            , fontWeightEnabled: false
            , fontWeight: ''

            , unicodeRangeEnabled: false
            , unicodeRange: ''
            })
          })}>
            {i18n('buttonCreateRule')}
          </Button>
        </div>

        <div className='space-x-2'>
          <Button onClick={() => setConfig(config => {
            config.rules = []
          })}>
            {i18n('buttonClearRules')}
          </Button>
          <Button>
            {i18n('buttonImportRules')}
          </Button>
          <Button>
            {i18n('buttonExportRules')}
          </Button>
        </div>
      </nav>

      <ul className='py-2 px-4'>
        {(config.rules ?? []).map((rule, i) => {
          return (
            <li key={rule.id} className='space-y-2 border-b py-2 last:border-b-0'>
              <div className='flex justify-between'>
                <div className='space-y-2'>
                  <section className='flex items-center'>
                    <label className='w-1/3'>{i18n('labelRuleType')}</label>

                    <Select
                      items={[
                        {
                          name: i18n('selectReplaceStandardFonts')
                        , value: FontType.Standard
                        }
                      , {
                          name: i18n('selectReplaceFixedWidthFonts')
                        , value: FontType.FixedWidth
                        }
                      ]}
                      value={rule.fontType}
                      onChange={fontType => setConfig(config => {
                        config.rules![i].fontType = fontType
                      })}
                    />
                  </section>

                  <section className='flex items-center'>
                    <label className='w-1/3'>{i18n('labelCustomFont')}</label>

                    <Select
                      items={
                        go(() => {
                          switch (rule.fontType) {
                            case FontType.Standard: return allFontList
                            case FontType.FixedWidth: return monospaceFontList
                            default: throw new Error('Unexpected route')
                          }
                        })
                          .sort()
                          .map(x => ({ name: x, value: x }))
                      }
                      value={rule.fontFamily}
                      onChange={fontFamily => setConfig(config => {
                        config.rules![i].fontFamily = fontFamily
                      })}
                    />
                  </section>
                </div>

                <aside className='space-x-2'>
                  <RemoveButton onClick={() => setConfig(config => {
                    config.rules!.splice(i, 1)
                  })} />
                  <UpButton
                    onClick={() => setConfig(config => {
                      const rules = config.rules!
                      const previousRule = rules[i - 1]
                      if (previousRule) {
                        rules[i] = previousRule
                        rules[i - 1] = rule
                      }
                    })}
                  />
                  <DownButton
                    onClick={() => setConfig(config => {
                      const rules = config.rules!
                      const nextRule = rules[i + 1]
                      if (nextRule) {
                        rules[i] = nextRule
                        rules[i + 1] = rule
                      }
                    })}
                  />
                  <Switch
                    value={rule.enabled}
                    onClick={value => setConfig(config => {
                      config.rules![i].enabled = value
                    })}
                  />
                </aside>
              </div>

              <AdvancedOptions
                rule={rule}
                ruleIndex={i}
                setConfig={setConfig}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
