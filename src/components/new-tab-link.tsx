export function NewTabLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      target='_blank'
      className='text-sky-600'
    />
  )
}
