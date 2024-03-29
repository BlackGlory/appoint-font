import { TrashIcon } from '@heroicons/react/24/solid'
import { IconButton } from '@components/icon-button'

export function RemoveButton(props: React.ComponentProps<typeof IconButton>) {
  return (
    <IconButton {...props}>
      <TrashIcon className='w-4 h-4' />
    </IconButton>
  )
}
