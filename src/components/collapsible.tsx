import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

interface IExpandableProps {
  label: string
  children: React.ReactNode
  defaultOpen: boolean
}

export function Collapsible({ label, children, defaultOpen }: IExpandableProps) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      <Disclosure.Button>
        {({ open }) => (
          <div className='w-full flex items-center cursor-pointer'>
            {
              open
              ? <ChevronDownIcon className='w-4 h-4' />
              : <ChevronRightIcon className='w-4 h-4'/>
            }
            <span>{label}</span>
          </div>
        )}
        
      </Disclosure.Button>
      <Disclosure.Panel>
        {children}
      </Disclosure.Panel>
    </Disclosure>
  )
}
