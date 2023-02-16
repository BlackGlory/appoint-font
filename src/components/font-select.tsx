import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/solid'

interface IFontSelectProps {
  fontList: string[]
  value?: string
  onChange(selectedFont: string): void
}

export function FontSelect({ value, fontList, onChange }: IFontSelectProps) {
  return (
    <div className='h-6 w-52 text-base'>
      <Listbox value={value} onChange={onChange}>
        <Listbox.Button className='pl-1 w-full h-full flex items-center border hover:bg-gray-300'>
          <span className='text-left flex-1'>{value}</span>
          <ChevronUpDownIcon
            className='h-5 w-5 text-gray-400'
            aria-hidden='true'
          />
        </Listbox.Button>
        <Listbox.Options className='max-h-64 bg-white overflow-y-scroll'>
          {fontList.map((font) => (
            <Listbox.Option key={font} value={font}>
              {font}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  )
}
