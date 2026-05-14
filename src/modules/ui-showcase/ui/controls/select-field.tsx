import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/shared/ui'

export function SelectField<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: TValue
  options: ReadonlyArray<TValue>
  onChange: (value: TValue) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(nextValue: string) => onChange(nextValue as TValue)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
