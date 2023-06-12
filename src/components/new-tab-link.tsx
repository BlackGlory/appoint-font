export function NewTabLink(
  props: Omit<
    React.ComponentPropsWithoutRef<'a'>
  , | 'target'
    | 'className'
  >
) {
  return (
    <a
      {...props}
      target='_blank'
      className='text-sky-600'
    />
  )
}
