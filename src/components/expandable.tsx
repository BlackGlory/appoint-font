import { useToggle } from 'extra-react-hooks'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import classNames from 'classnames'

interface IExpandableProps {
  label: string
  children: React.ReactNode
}

export function Expandable({ label, children }: IExpandableProps) {
  const [expanded, toggleExpanded] = useToggle(false)

  return (
    <div>
      <div
        className='w-full flex items-center cursor-pointer'
        onClick={toggleExpanded}
      >
        {
          expanded
          ? <ChevronDownIcon className='w-4 h-4' />
          : <ChevronRightIcon className='w-4 h-4'/>
        }
        <span>{label}</span>
      </div>
      <div className={classNames(!expanded && 'hidden')}>
        {children}
      </div>
    </div>
  )
}
