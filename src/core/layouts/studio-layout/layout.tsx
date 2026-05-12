import { Outlet } from '@tanstack/react-router'
import { Header } from './header'
import { Sidebar } from './sidebar'

export function StudioLayout() {
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
