import { PlusIcon } from '@heroicons/react/24/solid'
import { IconButton } from '@components/icon-button'

export function AddButton(
  props: Omit<
    React.ComponentPropsWithoutRef<typeof IconButton>
  , 'children'
  >
) {
  return (
    <IconButton {...props}>
      <PlusIcon className='w-4 h-4' />
    </IconButton>
  )
}
