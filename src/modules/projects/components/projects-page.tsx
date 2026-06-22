import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock3, FolderKanban, UsersRound, Video } from 'lucide-react'
import { useMemo, useState } from 'react'

import { initialProjects } from '../constants'
import { NewProjectCard } from './new-project-card'
import { ProjectExpandedContent, ProjectMedia } from './project-card-content'
import type { ProjectItem } from '../types'
import { ResizableCards } from '@/components/resizable-card'
import { Button } from '@/shared/ui'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Array<ProjectItem>>(initialProjects)
  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== 'archived').length,
    [projects],
  )

  const addProject = (project: ProjectItem) => {
    setProjects((current) => [project, ...current])
  }

  return (
    <div className="min-h-[calc(100vh-2rem)] overflow-auto p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <FolderKanban className="size-4" />
              Projects
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
              Your watch workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create room-ready projects, reopen old watch sessions, and keep synchronized playback
              contexts in one place.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-border bg-card/75 p-2 shadow-sm backdrop-blur">
            {[
              { label: 'Projects', value: projects.length, icon: FolderKanban },
              { label: 'Active', value: activeProjects, icon: UsersRound },
              {
                label: 'Videos',
                value: projects.reduce((total, project) => total + project.videos, 0),
                icon: Video,
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="min-w-24 rounded-2xl bg-card px-4 py-3 shadow-sm">
                  <Icon className="size-4 text-primary" />
                  <div className="mt-2 text-xl font-semibold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        <NewProjectCard onCreate={addProject} />

        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Existing projects
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open a saved project to inspect its room state and continue watching.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full bg-card">
              <Link to="/create">
                Create room
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <ResizableCards
            items={projects}
            presentation="media"
            animationPreset="surface-grow"
            variant="ghost"
            size="default"
            actionVariant="default"
            className="rounded-[2rem] border border-border bg-card/70 p-4 shadow-sm"
            listClassName="mx-0 max-w-none gap-4 md:grid-cols-2 xl:grid-cols-3"
            compactSize={{
              width: '100%',
              minHeight: '20rem',
            }}
            expandedSize={{
              initialWidth: 720,
              initialHeight: 620,
              minWidth: 420,
              minHeight: 420,
              maxWidth: 980,
              maxHeight: 780,
              viewportPadding: 24,
            }}
            renderMedia={(item) => <ProjectMedia item={item} />}
            renderAction={(item, state) =>
              state.expanded ? (
                <Button asChild className="rounded-full">
                  <Link to="/room/$code" params={{ code: item.roomCode }}>
                    {item.ctaText ?? 'Open'}
                  </Link>
                </Button>
              ) : null
            }
            renderContent={(item) => <ProjectExpandedContent item={item} />}
          />

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
            <Clock3 className="size-4 text-primary" />
            Recently created mock projects stay in this session only. Backend persistence can be
            wired into the same module later.
          </div>
        </section>
      </div>
    </div>
  )
}
