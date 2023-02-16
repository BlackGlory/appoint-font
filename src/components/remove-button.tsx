import { TrashIcon } from '@heroicons/react/24/solid'
import classNames from 'classnames'
import { IconButton } from '@components/icon-button'

export function RemoveButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <IconButton {...props}>
      <TrashIcon className='w-4 h-4' />
    </IconButton>
  )
}
