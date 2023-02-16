import { useState, useMemo } from 'react'
import { useMount } from 'extra-react-hooks'
import { FontSelect } from '@components/font-select'
import { FontPreview } from '@components/font-preview'
import { go } from '@blackglory/prelude'
import { getFontLists } from '@utils/font-list'
import { createBackgroundClient } from '@delight-rpc/webextension'
import { IAPI, IRule, FontType } from '@src/contract'
import { nanoid } from 'nanoid'

export function Options() {
  const client = useMemo(() => createBackgroundClient<IAPI>(), [])
  const [allFontList, setAllFontList] = useState<string[]>([])
  const [monospaceFontList, setMonospaceFontList] = useState<string[]>([])
  const [rules, setRules] = useState<IRule[]>([])

  useMount(() => {
    go(async () => {
      const { all, monospace } = await getFontLists()

      setAllFontList(all)
      setMonospaceFontList(monospace)

      await client.setFontList({ all, monospace })

      const config = await client.getConfig()
      if (config.rules) {
        config.rules
      }
    })
  })

  return (
    <div className='min-w-[600px] min-h-[500px] p-4 space-y-4 overflow-y-hidden'>
      <button
        className='border p-2'
        onClick={() => setRules(rules => [
          ...rules
        , {
            id: nanoid()
          , enabled: true
          , fontType: FontType.Standard
          }
        ])}
      >
        添加新规则
      </button>

      <div className='space-y-2'>
        {rules.map(rule => {
          return (
            <section key={rule.id} className='space-y-2 border'>
              <label><input className='border' type='checkbox' />启用</label>
              <button className='border'>移除</button>
              <div className='flex space-x-2 items-center'>
                <h2 className='text-base'>
                  {go(() => {
                    switch (rule.fontType) {
                      case FontType.Standard: return '标准字体'
                      case FontType.FixedWidth: return '等宽字体'
                      default: throw new Error('Unexpected route')
                    }
                  })}
                </h2>
                <FontSelect
                  fontList={
                    go(() => {
                      switch (rule.fontType) {
                        case FontType.Standard: return allFontList
                        case FontType.FixedWidth: return monospaceFontList
                        default: throw new Error('Unexpected route')
                      }
                    })
                  }
                  value={rule.fontFamily}
                  onChange={fontFamily => {
                    // TODO
                  }}
                />
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
            </section>
          )
        })}
      </div>
    </div>
  )
}
