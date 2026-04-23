import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Header } from '@/pages/_layout/header/ui/header'
import { Sidebar } from '@/pages/_layout/sidebar'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="bg-sidebar min-h-screen">
      <div className="p-4 flex items-start">
        <Sidebar className="py-6 pr-6 mr-2" />
        <div className="bg-background rounded-xl shadow-sm border shrink min-w-0 grow min-h-[calc(100vh-32px)]">
          <Header />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
