import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button, Input, type InputProps } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

interface SecureInputProps extends Omit<InputProps, 'tooltip'> {}

export const SecureInput = ({ className, ...props }: SecureInputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={cn(className, 'pr-12')}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setShowPassword((visible) => !visible)}
        className="absolute right-0.5 top-1/2 size-11 -translate-y-1/2 text-muted-foreground"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
        aria-controls={props.id}
        disabled={props.disabled}
      >
        {showPassword ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  )
}
