import type { SettingsDialogSection } from './settings-dialog'

export type SettingsSearchItem = {
  label: string
  keywords?: string

  target?: string
}

export type SettingsSearchResult = SettingsSearchItem & {
  sectionId: string
  tabId?: string
  path: string
}

export function searchSettings(sections: ReadonlyArray<SettingsDialogSection>, query: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const results: Array<SettingsSearchResult> = []
  for (const section of sections) {
    const destinations = section.tabs ?? [section]
    for (const destination of destinations) {
      const path = section.tabs ? `${section.label} / ${destination.label}` : section.label
      const items = destination.searchItems ?? [
        { label: destination.label, keywords: section.description },
      ]
      for (const item of items) {
        const text = `${path} ${item.label} ${item.keywords ?? ''}`.toLocaleLowerCase()
        if (words.every((word) => text.includes(word))) {
          results.push({
            ...item,
            sectionId: section.id,
            tabId: section.tabs ? destination.id : undefined,
            path,
          })
        }
      }
    }
  }
  return results
}
