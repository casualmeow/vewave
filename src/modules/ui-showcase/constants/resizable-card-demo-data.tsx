import type { ResizableCardItem } from '@/components/resizable-card'

export const mediaCardItems: Array<ResizableCardItem> = [
  {
    id: 'lana-del-rey',
    description: 'Lana Del Rey',
    title: 'Summertime Sadness',
    src: 'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
    imageAlt: 'Lana Del Rey portrait',
    ctaText: 'Play',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <p>
        A cinematic pop reference with moody color, soft-focus photography, and enough expanded copy
        to test a card surface that grows from compact artwork into a readable detail view.
      </p>
    ),
  },
  {
    id: 'babbu-maan',
    description: 'Babbu Maan',
    title: 'Mitran Di Chhatri',
    src: 'https://assets.aceternity.com/demos/babbu-maan.jpeg',
    imageAlt: 'Babbu Maan portrait',
    ctaText: 'Play',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <p>
        A warmer portrait-led example for checking how title, artist, and media continuity behave
        when the compact card and expanded surface share the same visual identity.
      </p>
    ),
  },
  {
    id: 'metallica',
    description: 'Metallica',
    title: 'For Whom The Bell Tolls',
    src: 'https://assets.aceternity.com/demos/metallica.jpeg',
    imageAlt: 'Metallica performance',
    ctaText: 'Play',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <p>
        A high-contrast performance card that makes image cropping, shadow depth, and backdrop
        treatment easy to inspect during repeated open and close transitions.
      </p>
    ),
  },
  {
    id: 'led-zeppelin',
    description: 'Led Zeppelin',
    title: 'Stairway To Heaven',
    src: 'https://assets.aceternity.com/demos/led-zeppelin.jpeg',
    imageAlt: 'Led Zeppelin artwork',
    ctaText: 'Play',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <p>
        A classic-rock entry that mirrors the reference card list shape: compact artwork, concise
        metadata, a CTA, and expanded copy that should reveal without disturbing the shared morph.
      </p>
    ),
  },
  {
    id: 'toh-phir-aao',
    description: 'Mustafa Zahid',
    title: 'Toh Phir Aao',
    src: 'https://assets.aceternity.com/demos/toh-phir-aao.jpeg',
    imageAlt: 'Toh Phir Aao artwork',
    ctaText: 'Play',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <p>
        A darker artwork sample for testing how the expanded media surface handles content density,
        readable spacing, and a clean close animation back to the selected compact card.
      </p>
    ),
  },
  {
    id: 'aap-ka-suroor',
    description: 'Lord Himesh',
    title: 'Aap Ka Suroor',
    src: 'https://assets.aceternity.com/demos/aap-ka-suroor.jpeg',
    imageAlt: 'Aap Ka Suroor artwork',
    ctaText: 'Play',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <p>
        A saturated album-art card that helps compare the data-driven media presentation with the
        Shadix-style compound API shown below.
      </p>
    ),
  },
]
