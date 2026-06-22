import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, CircleAlert, CircleCheck, Clock3, RefreshCcw } from 'lucide-react'
import { getApiAuthMe } from '@/core/api/generated/auth/auth'
import { getApiHealth, getApiHealthDb } from '@/core/api/generated/health/health'
import { describeApiError } from '@/core/api/http/errors'
import { refreshSessionOnce } from '@/core/api/http/refresh-session'
import { apiUrl, wsUrl } from '@/shared/config'
import { useAuthStore } from '@/modules/auth'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

type CheckStatus = 'idle' | 'running' | 'passed' | 'failed'

type CheckResult = {
  id: string
  title: string
  description: string
  status: CheckStatus
  detail?: string
}

const baseChecks: Array<CheckResult> = [
  {
    id: 'api-health',
    title: 'API health',
    description: 'GET /api/health without auth.',
    status: 'idle',
  },
  {
    id: 'db-health',
    title: 'Database health',
    description: 'GET /api/health/db for backend database readiness.',
    status: 'idle',
  },
  {
    id: 'refresh',
    title: 'Refresh cookie',
    description: 'POST /api/auth/refresh using HTTP-only cookie credentials.',
    status: 'idle',
  },
  {
    id: 'me',
    title: 'Current user',
    description: 'GET /api/auth/me using the in-memory Bearer access token.',
    status: 'idle',
  },
]

function maskToken(token: string) {
  return token.length <= 12
    ? `${token.slice(0, 4)}...`
    : `${token.slice(0, 8)}...${token.slice(-4)}`
}

export function HealthcheckPage() {
  const [checks, setChecks] = useState(baseChecks)
  const [running, setRunning] = useState(false)
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setAnonymous = useAuthStore((state) => state.setAnonymous)

  const passedCount = useMemo(
    () => checks.filter((check) => check.status === 'passed').length,
    [checks],
  )

  const updateCheck = useCallback((id: string, patch: Partial<CheckResult>) => {
    setChecks((current) =>
      current.map((check) => (check.id === id ? { ...check, ...patch } : check)),
    )
  }, [])

  const runStep = useCallback(
    async (id: string, fn: () => Promise<string>) => {
      updateCheck(id, { status: 'running', detail: undefined })

      try {
        const detail = await fn()
        updateCheck(id, { status: 'passed', detail })
      } catch (error) {
        const description = describeApiError(error)

        updateCheck(id, {
          status: 'failed',
          detail: `${description.title}: ${description.message}`,
        })

        if (id === 'refresh' && useAuthStore.getState().status === 'bootstrapping') {
          setAnonymous()
        }
      }
    },
    [setAnonymous, updateCheck],
  )

  const runChecks = useCallback(async () => {
    setRunning(true)
    setChecks(baseChecks.map((check) => ({ ...check, status: 'idle', detail: undefined })))

    await runStep('api-health', async () => {
      const response = await getApiHealth()

      return `Backend responded: ${JSON.stringify(response)}`
    })

    await runStep('db-health', async () => {
      const response = await getApiHealthDb()

      return `Database check responded: ${JSON.stringify(response)}`
    })

    await runStep('refresh', async () => {
      const token = await refreshSessionOnce()
      setAccessToken(token)

      return `Refresh succeeded. Access token: ${maskToken(token)}`
    })

    await runStep('me', async () => {
      const token = useAuthStore.getState().accessToken
      const response = await getApiAuthMe()

      if (token) {
        setAuthenticated(response.user, token)
      }

      return `Current user: ${response.user.email}`
    })

    setRunning(false)
  }, [runStep, setAccessToken, setAuthenticated])

  useEffect(() => {
    void runChecks()
  }, [runChecks])

  return (
    <div className="min-h-[calc(100vh-2rem)] overflow-auto p-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Activity className="size-4" />
              Healthcheck
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
              Frontend auth diagnostics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Checks backend reachability, CORS/credentials behavior, refresh-cookie recovery, and
              the current user endpoint.
            </p>
          </div>

          <Button onClick={() => void runChecks()} disabled={running} className="rounded-full">
            <RefreshCcw className="size-4" />
            {running ? 'Checking...' : 'Run checks'}
          </Button>
        </section>

        <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Runtime state</CardTitle>
              <CardDescription>Values used by the current browser session.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <RuntimeRow label="API URL" value={apiUrl} />
              <RuntimeRow label="WS URL" value={wsUrl} />
              <RuntimeRow label="Auth status" value={status} />
              <RuntimeRow label="User" value={user ? `${user.name} <${user.email}>` : 'None'} />
              <RuntimeRow
                label="Access token"
                value={accessToken ? maskToken(accessToken) : 'None in memory'}
              />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/70 bg-card/85 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle>Checks</CardTitle>
              <CardDescription>
                {passedCount}/{checks.length} checks passed. A CORS failure usually appears as a
                browser Network Error with no HTTP status.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {checks.map((check) => (
                <CheckCard key={check.id} check={check} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RuntimeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-2xl border border-border bg-card/70 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="break-all font-medium text-foreground">{value}</div>
    </div>
  )
}

function CheckCard({ check }: { check: CheckResult }) {
  const Icon =
    check.status === 'passed'
      ? CircleCheck
      : check.status === 'failed'
        ? CircleAlert
        : check.status === 'running'
          ? RefreshCcw
          : Clock3

  return (
    <div className="grid gap-2 rounded-2xl border border-border bg-card/70 p-4">
      <div className="flex items-start gap-3">
        <span
          className={
            check.status === 'passed'
              ? 'text-primary'
              : check.status === 'failed'
                ? 'text-destructive'
                : check.status === 'running'
                  ? 'text-primary'
                  : 'text-muted-foreground'
          }
        >
          <Icon className={check.status === 'running' ? 'size-5 animate-spin' : 'size-5'} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-foreground">{check.title}</div>
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {check.status}
            </span>
          </div>
          <div className="mt-1 text-sm leading-6 text-muted-foreground">{check.description}</div>
          {check.detail ? (
            <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-foreground p-3 text-xs leading-5 text-background">
              {check.detail}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  )
}
