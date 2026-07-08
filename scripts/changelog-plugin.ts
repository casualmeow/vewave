import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

export interface ChangelogPluginOptions {
  changelogFile?: string
  commitCount?: number
}

interface ChangelogCommit {
  hash: string
  shortHash: string
  author: string
  date: string
  subject: string
}

const VIRTUAL_ID = 'virtual:vewave-changelog'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

function readChangelogMarkdown(changelogPath: string): string {
  if (!existsSync(changelogPath)) return ''

  return readFileSync(changelogPath, 'utf8')
}

function readCommits(root: string, commitCount: number): Array<ChangelogCommit> {
  try {
    // commitCount <= 0 means "all commits" (no --max-count cap).
    const args = ['log', '--date=short', '--pretty=format:%H%x09%an%x09%ad%x09%s']
    if (commitCount > 0) args.splice(1, 0, `--max-count=${commitCount}`)

    const output = execFileSync('git', args, { cwd: root, encoding: 'utf8' })

    return output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, author, date, ...subjectParts] = line.split('\t')

        return {
          hash,
          shortHash: hash.slice(0, 7),
          author,
          date,
          subject: subjectParts.join('\t'),
        }
      })
  } catch {
    return []
  }
}

/**
 * Serves `virtual:vewave-changelog` with the raw CHANGELOG.md contents and
 * recent git commit history, both read on the node side at dev/build time.
 */
export function changelogPlugin({
  changelogFile = 'CHANGELOG.md',
  commitCount = 0,
}: ChangelogPluginOptions = {}): Plugin {
  let root = process.cwd()

  return {
    name: 'vewave-changelog',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID

      return undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined

      const changelogPath = resolve(root, changelogFile)
      const markdown = readChangelogMarkdown(changelogPath)
      const commits = readCommits(root, commitCount)

      return [
        `export const changelogMarkdown = ${JSON.stringify(markdown)}`,
        `export const commits = ${JSON.stringify(commits)}`,
      ].join('\n')
    },
    configureServer(server) {
      const changelogPath = resolve(root, changelogFile)

      server.watcher.add(changelogPath)
      server.watcher.on('change', (file) => {
        if (resolve(file) !== changelogPath) return

        const module = server.moduleGraph.getModuleById(RESOLVED_ID)

        if (module) {
          server.moduleGraph.invalidateModule(module)
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
  }
}
