import { useToggle } from 'extra-react-hooks'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import classNames from 'classnames'

interface ICollapsibleProps {
  label: string
  children: React.ReactNode
}

export function Expandable({ label, children }: ICollapsibleProps) {
  const [collapsed, toggleCollapsed] = useToggle(true)

  return (
    <div>
      <div className='w-full flex items-center cursor-pointer' onClick={toggleCollapsed}>
        {
          collapsed
          ? <ChevronRightIcon className='w-4 h-4'/>
          : <ChevronDownIcon className='w-4 h-4' />
        }
        <span>{label}</span>
      </div>
      <div className={classNames(collapsed && 'hidden')}>
        {children}
      </div>
    </div>
  )
}
