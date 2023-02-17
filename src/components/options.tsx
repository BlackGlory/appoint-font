import { useState, useMemo } from 'react'
import { useMount } from 'extra-react-hooks'
import { Select } from '@components/select'
import { assert, go, isntUndefined } from '@blackglory/prelude'
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
import { Base64 } from 'js-base64'
import { isRuleArray } from '@utils/validator'
import { Modal } from '@components/modal'
import { useImmer } from 'use-immer'

interface IModal {
  isOpen: boolean
  message: string
}

export function Options() {
  const client = useMemo(() => createBackgroundClient<IAPI>(), [])
  const [allFontList, setAllFontList] = useState<string[]>([])
  const [monospaceFontList, setMonospaceFontList] = useState<string[]>([])
  const [config, setConfig] = useConfig(client)
  const [modal, setModal] = useImmer<IModal>({
    isOpen: false
  , message: ''
  })

  useMount(() => {
    go(async () => {
      const { all, monospace } = await client.getFontList()

      setAllFontList(all)
      setMonospaceFontList(monospace)
    })
  })

  return (
    <div className='min-w-[500px] min-h-[500px]'>
      <Modal
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal(modal => {
          modal.isOpen = false
        })}
      />

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
                setConfig(config => {
                  for (const newRule of newRules) {
                    const index = config.rules?.findIndex(rule => {
                      return newRule.id === rule.id
                    })

                    if (isntUndefined(index) && index >= 0) {
                      config.rules![index] = newRule
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
                setModal({
                  isOpen: true
                , message: i18n('alertInvalidRuleFile')
                })
              }
            }, { once: true })
            input.click()
          }}>
            {i18n('buttonImportRules')}
          </Button>
          <Button onClick={() => {
            const json = JSON.stringify(config.rules ?? [], null, 2)

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

function jsonToDataURL(json: string): string {
  return 'data:application/json;base64,' + Base64.encode(json)
}
