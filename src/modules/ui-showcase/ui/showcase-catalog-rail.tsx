import { motion } from 'motion/react'
import { catalogItems } from '../mocks'

export function ShowcaseCatalogRail() {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-foreground">Catalog rail</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Horizontal module cards for quick scanning across playground sections.
          </p>
        </div>
      </div>

      <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {catalogItems.map((item) => {
          const Icon = item.icon

          return (
            <motion.a
              key={item.label}
              href={item.href}
              whileHover={{ y: -6, scale: 1.015 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="group relative min-h-56 w-[18rem] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-foreground p-5 text-background shadow-sm sm:w-[22rem]"
            >
              <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${item.tone}`} />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(9,9,11,0.42)_42%,rgba(9,9,11,0.96)_100%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="grid size-11 place-items-center rounded-full bg-background/20 backdrop-blur-md">
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-semibold tracking-tight">{item.label}</div>
                  <p className="mt-2 text-sm leading-6 text-background/80">{item.description}</p>
                </div>
              </div>
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}
