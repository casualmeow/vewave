import { z } from 'zod'

const defaultApiUrl = 'http://localhost:3001'
const defaultWsUrl = 'ws://localhost:3001'

const urlSchema = z.string().url()

function readUrl(name: 'VITE_API_URL' | 'VITE_WS_URL', fallback: string) {
  const value = import.meta.env[name] || fallback
  const result = urlSchema.safeParse(value)

  if (!result.success) {
    throw new Error(`${name} must be a valid URL. Received: ${value}`)
  }

  return result.data.replace(/\/$/, '')
}

export const env = {
  apiUrl: readUrl('VITE_API_URL', defaultApiUrl),
  wsUrl: readUrl('VITE_WS_URL', defaultWsUrl),
} as const

export const { apiUrl, wsUrl } = env
