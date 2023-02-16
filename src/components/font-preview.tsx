import { useState } from 'react'
import { FontSizeController } from '@components/font-size-controller'
import { FontRenderer } from '@components/font-renderer'

interface IFontPreviewProps {
  fontFamily: string
  initialFontSize: number
  children: React.ReactNode
}

export function FontPreview({
  fontFamily
, initialFontSize
, children
}: IFontPreviewProps) {
  const [fontSize, setFontSize] = useState(initialFontSize)

  return <>
    <FontSizeController
      min={8}
      max={32}
      value={fontSize}
      onChange={setFontSize}
    />

    <FontRenderer fontFamily={fontFamily} fontSize={fontSize}>
      {children}
    </FontRenderer>
  </>
}
