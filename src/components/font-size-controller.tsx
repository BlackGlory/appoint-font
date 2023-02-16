interface IFontSizeSliderProps {
  min: number
  max: number
  value: number
  onChange(value: number): void
}

export function FontSizeController({ min, max, value, onChange }: IFontSizeSliderProps) {
  return (
    <div className='flex space-x-2'>
      <input
        type='range'
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={e => onChange(e.target.valueAsNumber)}
      />

      <div>
        <input
          type='number'
          className='border w-8'
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={e => onChange(e.target.valueAsNumber)}
        />
        <span>px</span>
      </div>
    </div>
  )
}