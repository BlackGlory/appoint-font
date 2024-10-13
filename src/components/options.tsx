import { useState, useMemo } from 'react'
import { useMountAsync } from 'extra-react-hooks'
import { Select } from '@components/select'
import { assert, go, isntUndefined } from '@blackglory/prelude'
import { createBackgroundClient } from '@delight-rpc/webextension'
import { IBackgroundAPI, FontType } from '@src/contract'
import { nanoid } from 'nanoid'
import { Button } from '@components/button'
import { RemoveButton } from '@components/remove-button'
import { UpButton } from '@components/up-button'
import { DownButton } from '@components/down-button'
import { Switch } from '@components/switch'
import { AdvancedOptions } from '@components/advanced-options'
import { i18n } from '@utils/i18n'
import { Base64 } from 'js-base64'
import { isRuleArray } from '@utils/validator'
import { MessageBox } from '@components/message-box'
import { useImmer } from 'use-immer'
import { compareStringsAscending } from 'extra-sort'
import LoadingIcons from 'react-loading-icons'
import { ConfigStoreContext } from '@utils/config-store'
import { useSelector, useUpdater } from 'extra-react-store'

interface IMessageBoxState {
  isOpen: boolean
  content: React.ReactNode
}

export function Options() {
  const rules = useSelector(ConfigStoreContext, config => config.rules)
  const updateConfig = useUpdater(ConfigStoreContext)
  const client = useMemo(() => createBackgroundClient<IBackgroundAPI>(), [])
  const [loading, setLoading] = useState<boolean>(true)
  const [allFontList, setAllFontList] = useState<chrome.fontSettings.FontName[]>([])
  const [monospaceFontList, setMonospaceFontList] = useState<chrome.fontSettings.FontName[]>([])
  const [messageBox, setMessageBox] = useImmer<IMessageBoxState>({
    isOpen: false
  , content: null
  })

  useMountAsync(async () => {
    const { all, monospace } = await client.getFontList()

    setAllFontList(all)
    setMonospaceFontList(monospace)
    setLoading(false)
  })

  return (
    <div className='min-w-[500px] min-h-[500px]'>
      {
        loading
        ? (
            <div className='h-screen flex flex-col items-center justify-center gap-4'>
              <LoadingIcons.Oval stroke='#000000' strokeWidth={6} />
              <span className='text-sm font-semibold'>{i18n('iconLoading')}</span>
            </div>
          )
        : (
            <>
              <MessageBox
                isOpen={messageBox.isOpen}
                onClose={() => setMessageBox(modal => {
                  modal.isOpen = false
                })}
              >
                {messageBox.content}
              </MessageBox>

              <nav className='bg-gray-50 px-4 py-2 border-y sticky top-0 flex justify-between'>
                <div className='space-x-2'>
                  <Button onClick={() => updateConfig(config => {
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

                    , subFontFamilyEnabled: false
                    , subFontFamily: ''

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
                  <Button onClick={() => updateConfig(config => {
                    config.rules = []
                  })}>
                    {i18n('buttonClearRules')}
                  </Button>
                  <Button onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.json,application/json'
                    input.addEventListener('change', async () => {
                      try {
                        const text = await input.files?.item(0)?.text()
                        assert(isntUndefined(text), 'The text is undefined')
                        const json = JSON.parse(text)
                        assert(isRuleArray(json), 'Invalid rule file')

                        const newRules = json
                        updateConfig(config => {
                          for (const newRule of newRules) {
                            const index = config.rules.findIndex(rule => {
                              return newRule.id === rule.id
                            })

                            if (isntUndefined(index) && index >= 0) {
                              config.rules[index] = newRule
                            } else {
                              if (!config.rules) {
                                config.rules = []
                              }
                              config.rules.push(newRule)
                            }
                          }
                        })
                      } catch (e) {
                        console.warn(e)
                        setMessageBox({
                          isOpen: true
                        , content: i18n('alertInvalidRuleFile')
                        })
                      }
                    }, { once: true })
                    input.click()
                  }}>
                    {i18n('buttonImportRules')}
                  </Button>
                  <Button onClick={() => {
                    const json = JSON.stringify(rules, null, 2)

                    chrome.downloads.download({
                      url: jsonToDataURL(json)
                    , filename: 'appoint-font-rules.json'
                    , saveAs: true
                    })
                  }}>
                    {i18n('buttonExportRules')}
                  </Button>
                </div>
              </nav>

              <ul className='py-2 px-4'>
                {rules.map((rule, i) => (
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
                            onChange={fontType => updateConfig(config => {
                              config.rules[i].fontType = fontType
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
                                .map(x => ({ name: x.displayName, value: x.fontId }))
                                .sort((a, b) => compareStringsAscending(a.name, b.name))
                            }
                            value={rule.fontFamily}
                            onChange={fontFamily => updateConfig(config => {
                              config.rules[i].fontFamily = fontFamily
                            })}
                          />
                        </section>
                      </div>

                      <aside className='space-x-2'>
                        <RemoveButton onClick={() => updateConfig(config => {
                          config.rules.splice(i, 1)
                        })} />
                        <UpButton
                          onClick={() => updateConfig(config => {
                            const rules = config.rules
                            const previousRule = rules[i - 1]
                            if (previousRule) {
                              rules[i] = previousRule
                              rules[i - 1] = rule
                            }
                          })}
                        />
                        <DownButton
                          onClick={() => updateConfig(config => {
                            const rules = config.rules
                            const nextRule = rules[i + 1]
                            if (nextRule) {
                              rules[i] = nextRule
                              rules[i + 1] = rule
                            }
                          })}
                        />
                        <Switch
                          value={rule.enabled}
                          onChange={value => updateConfig(config => {
                            config.rules[i].enabled = value
                          })}
                        />
                      </aside>
                    </div>

                    <AdvancedOptions
                      rule={rule}
                      ruleIndex={i}
                    />
                  </li>
                ))}
              </ul>
            </>
          )
      }
    </div>
  )
}

function jsonToDataURL(json: string): string {
  return 'data:application/json;base64,' + Base64.encode(json)
}
