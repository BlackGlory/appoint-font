import styled, { css } from 'styled-components'

interface IFontRendererProps {
  fontFamily: string
  fontSize: number
}

export const FontRenderer = styled.div<IFontRendererProps>`
  ${({ fontFamily, fontSize }) => css`
    font-family: ${ fontFamily };
    font-size: ${ fontSize }px;
  `}
`
