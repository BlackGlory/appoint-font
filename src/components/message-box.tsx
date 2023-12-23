import { Dialog } from '@headlessui/react'
import { Button } from '@components/button'

export interface IMessageBoxProps {
  children: React.ReactNode

  isOpen: boolean
  onClose: () => void
}

export function MessageBox({ children, isOpen, onClose }: IMessageBoxProps) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8'>
        <Dialog.Panel className='border rounded px-8 py-4 bg-white shadow flex flex-col items-center space-y-4'>
          <Dialog.Description className='text-base'>
            {children}
          </Dialog.Description>

          <Button onClick={onClose}>OK</Button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
