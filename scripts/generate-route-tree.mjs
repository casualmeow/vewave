import { Generator, getConfig } from '@tanstack/router-generator'

const root = process.cwd()
const config = getConfig(
  {
    autoCodeSplitting: true,
  },
  root,
)

await new Generator({ config, root }).run()
