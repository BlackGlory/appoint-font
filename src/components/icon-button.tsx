import classNames from 'classnames'

export function IconButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        classNames(
          'border p-1'
        , 'hover:bg-gray-300 disabled:bg-gray-300'
        , 'text-gray-700 hover:text-gray-900'
        , props.className
        )
      }
    />
  )
}
