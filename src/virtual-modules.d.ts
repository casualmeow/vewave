declare module 'virtual:vewave-changelog' {
  export interface ChangelogCommit {
    hash: string
    shortHash: string
    author: string
    date: string
    subject: string
  }

  export const changelogMarkdown: string
  export const commits: Array<ChangelogCommit>
}
