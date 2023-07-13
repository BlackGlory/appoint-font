import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

interface ICollapsibleProps {
  label: string
  children: React.ReactNode
  defaultOpen: boolean
}

export function Collapsible({ label, children, defaultOpen }: ICollapsibleProps) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      <Disclosure.Button className='w-full flex items-center cursor-pointer'>
        {({ open }) => (
          <>
            {
              open
              ? <ChevronDownIcon className='w-4 h-4' />
              : <ChevronRightIcon className='w-4 h-4'/>
            }
            <span>{label}</span>
          </>
        )}
        
      </Disclosure.Button>
      <Disclosure.Panel>
        {children}
      </Disclosure.Panel>
    </Disclosure>
  )
}
