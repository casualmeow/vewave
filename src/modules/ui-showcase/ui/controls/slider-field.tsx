import { Input, Label, Slider } from '@/shared/ui'

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs tabular-nums text-zinc-500">
          {Number.isInteger(value) ? value : value.toFixed(2)}
          {unit}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_4.5rem] gap-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([nextValue]: Array<number>) => {
            if (nextValue == null) return
            onChange(nextValue)
          }}
        />
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          className="h-8 pr-2 text-sm"
          onChange={(event) => {
            const nextValue = Number(event.target.value)
            if (Number.isNaN(nextValue)) return
            onChange(Math.min(Math.max(nextValue, min), max))
          }}
        />
      </div>
    </div>
  )
}
