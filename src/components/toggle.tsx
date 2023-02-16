import { Switch } from '@headlessui/react'
import classNames from 'classnames'

interface IToggleProps {
  value: boolean
  onClick: (value: boolean) => void
}

export function Toggle({ value, onClick }: IToggleProps) {
  return (
    <Switch
      checked={value}
      onChange={onClick}
      className={classNames(
        'inline-flex h-6 w-11 items-center rounded-full'
      , value ? 'bg-gray-700' : 'bg-gray-300'
      )}
    >
      <span
        className={classNames(
          'inline-block h-4 w-4 rounded-full transform bg-white transition'
        , value ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </Switch>
  )
}
