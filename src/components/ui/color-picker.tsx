import type React from 'react'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex flex-col items-center">
      <HexColorPicker color={color} onChange={onChange} />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 px-2 py-1 border border-gray-300 rounded"
      />
    </div>
  )
}
