import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '../model'
import { postApiAuthLogout } from '@/core/api/generated/auth/auth'
import { getApiErrorMessage } from '@/core/api/http/errors'

export function useLogout() {
  const navigate = useNavigate()
  const setAnonymous = useAuthStore((state) => state.setAnonymous)

  return async () => {
    try {
      await postApiAuthLogout()
      toast.success('Signed out')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to sign out.'))
    } finally {
      setAnonymous()
      await navigate({ to: '/' })
    }
  }
}
