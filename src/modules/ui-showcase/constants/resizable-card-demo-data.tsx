import type { ExpandableCardItem } from '@/components/resizable-card'

export const mediaCardItems: Array<ExpandableCardItem> = [
  {
    id: 'lana-del-rey',
    description: 'Lana Del Rey',
    title: 'Summertime Sadness',
    src: 'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
    imageAlt: 'Lana Del Rey portrait',
    ctaText: 'Visit',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <>
        Lana Del Rey is known for cinematic pop, melancholic atmosphere, and visual storytelling.
        This card uses the same reusable item fields as the reference demo: media source, title,
        description, CTA link, and long-form content.
      </>
    ),
  },
  {
    id: 'babbu-maan',
    description: 'Babbu Maan',
    title: 'Mitran Di Chhatri',
    src: 'https://assets.aceternity.com/demos/babbu-maan.jpeg',
    imageAlt: 'Babbu Maan portrait',
    ctaText: 'Visit',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <>
        Babbu Maan is a Punjabi singer and songwriter with a large catalog of narrative songs. The
        media presentation keeps the image, title, and description structurally aligned between
        compact and expanded states.
      </>
    ),
  },
  {
    id: 'metallica',
    description: 'Metallica',
    title: 'For Whom The Bell Tolls',
    src: 'https://assets.aceternity.com/demos/metallica.jpeg',
    imageAlt: 'Metallica performance',
    ctaText: 'Visit',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <>
        Metallica brings a heavier visual example to the gallery. The expanded content fades in
        independently while the card, image, title, and description morph through shared layout ids.
      </>
    ),
  },
  {
    id: 'himesh-reshammiya',
    description: 'Lord Himesh',
    title: 'Aap Ka Suroor',
    src: 'https://assets.aceternity.com/demos/aap-ka-suroor.jpeg',
    imageAlt: 'Himesh Reshammiya album art',
    ctaText: 'Visit',
    ctaLink: 'https://ui.aceternity.com/templates',
    content: () => (
      <>
        Himesh Reshammiya rounds out the demo set with another image-heavy card. This data shape can
        be replaced with product, profile, article, or media library content without changing the
        component controller.
      </>
    ),
  },
]
