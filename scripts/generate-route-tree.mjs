import { Generator, getConfig } from '@tanstack/router-generator'
import { cleanSourceComments } from './source-comments.mjs'

const root = process.cwd()
const config = getConfig(
  {
    autoCodeSplitting: true,
    routeTreeFileHeader: [],
  },
  root,
)

await new Generator({ config, root }).run()
cleanSourceComments([config.generatedRouteTree])
