import { Checkbox } from '@/shared/ui'

export function CheckboxField({
  label,
  checked,
  disabled = false,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm has-disabled:opacity-50">
      <span>{label}</span>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(nextChecked: boolean | 'indeterminate') => onChange(nextChecked === true)}
      />
    </label>
  )
}
