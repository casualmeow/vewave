# Header usage

`Header` is a scroll-reactive header component built for React 19. It supports glass/solid visual variants, animated width collapse, optional hide-on-scroll behavior, navigation slots, action slots, manual collapse mode, reduced-motion handling, and a small set of composition helpers:

- `Header`
- `HeaderLogo`
- `HeaderNav`
- `HeaderNavItem`
- `HeaderButton`
- `HeaderSpacer`

The component is intended to be used as an application-level header or as a reusable UI primitive inside a layout.

---

## Requirements

Install the runtime dependencies used by the component:

```bash
npm i motion class-variance-authority
```

The component also expects the local project utilities and companion files used in the implementation:

```txt
./config
./header.variants
./types
./utils
@/shared/lib/utils
```

The examples below assume that the header module is exported from a path similar to:

```ts
import {
  HeaderButton,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderSpacer,
  Header,
} from '@/components/header'
```

Adjust the import path to match your project.

---

## Basic usage

A typical header contains a logo, navigation, and actions.

```tsx
'use client'

import {
  HeaderButton,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderSpacer,
  Header,
} from '@/components/header'

export function MarketingLayoutHeader() {
  return (
    <>
      <Header
        logo={<HeaderLogo text="Vewave" href="/" />}
        navigation={
          <HeaderNav>
            <HeaderNavItem href="/" active>
              Home
            </HeaderNavItem>
            <HeaderNavItem href="/features">Features</HeaderNavItem>
            <HeaderNavItem href="/pricing">Pricing</HeaderNavItem>
          </HeaderNav>
        }
        actions={
          <>
            <HeaderButton variant="ghost">Sign in</HeaderButton>
            <HeaderButton>Get started</HeaderButton>
          </>
        }
      />

      <HeaderSpacer />
    </>
  )
}
```

`HeaderSpacer` reserves vertical space for the fixed header so that page content does not begin underneath it.

---

## Recommended layout usage

A common pattern is to keep the header inside a layout component and render the page content after `HeaderSpacer`.

```tsx
'use client'

import type { ReactNode } from 'react'
import {
  HeaderButton,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderSpacer,
  Header,
} from '@/components/header'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header
        variant="glass"
        size="md"
        position="fixed"
        showGlow
        logo={<HeaderLogo text="Vewave" href="/" />}
        navigation={
          <HeaderNav>
            <HeaderNavItem href="/">Overview</HeaderNavItem>
            <HeaderNavItem href="/rooms">Rooms</HeaderNavItem>
            <HeaderNavItem href="/studio">Studio</HeaderNavItem>
          </HeaderNav>
        }
        actions={<HeaderButton>Create room</HeaderButton>}
      />

      <HeaderSpacer size="md" />

      <main>{children}</main>
    </>
  )
}
```

---

## Scroll collapse behavior

By default the header uses:

```ts
collapseBehavior = 'scroll'
```

Its width and radius animate according to page scroll progress. The collapse state becomes `collapsed` when the progress crosses `collapseThreshold`.

```tsx
<Header
  initialWidth={92}
  collapsedWidth={48}
  scrollDistance={220}
  collapseThreshold={0.6}
  logo={<HeaderLogo text="Vewave" href="/" />}
  navigation={
    <HeaderNav>
      <HeaderNavItem href="/docs">Docs</HeaderNavItem>
      <HeaderNavItem href="/blog">Blog</HeaderNavItem>
    </HeaderNav>
  }
  actions={<HeaderButton>Open app</HeaderButton>}
/>
```

### Width values

`initialWidth` and `collapsedWidth` accept either:

- a number, interpreted as a percentage;
- a CSS length string, for example `"min(92vw, 72rem)"`.

```tsx
<Header initialWidth="min(92vw, 72rem)" collapsedWidth="min(60vw, 44rem)" maxWidth="72rem" />
```

When string widths are used, it is best to keep both widths in compatible CSS units or expressions.

---

## Hide on scroll down

Set `hideOnScrollDown` to move the header out of view when scrolling down and reveal it when scrolling up.

```tsx
<Header
  hideOnScrollDown
  revealAtTop={24}
  logo={<HeaderLogo text="Vewave" href="/" />}
  navigation={
    <HeaderNav>
      <HeaderNavItem href="/discover">Discover</HeaderNavItem>
      <HeaderNavItem href="/collections">Collections</HeaderNavItem>
    </HeaderNav>
  }
  actions={<HeaderButton variant="outline">Profile</HeaderButton>}
/>
```

`revealAtTop` forces the header to stay visible near the top of the document.

---

## Manual collapse mode

Use manual mode when collapse should be controlled by application state rather than scroll position.

```tsx
'use client'

import { useState } from 'react'
import { HeaderButton, HeaderLogo, Header } from '@/components/header'

export function ManualCollapseHeader() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Header
      collapseBehavior="manual"
      collapsed={collapsed}
      logo={<HeaderLogo text="Dashboard" href="/dashboard" />}
      actions={
        <HeaderButton onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? 'Expand' : 'Collapse'}
        </HeaderButton>
      }
    />
  )
}
```

`defaultCollapsed` is a fallback value used when `collapsed` is omitted. It does not create an internally toggled uncontrolled header state.

```tsx
<Header
  collapseBehavior="manual"
  defaultCollapsed
  logo={<HeaderLogo text="Dashboard" href="/dashboard" />}
/>
```

---

## Disable collapse completely

Use `collapseBehavior="none"` when the component should stay fully expanded.

```tsx
<Header
  collapseBehavior="none"
  logo={<HeaderLogo text="Admin" href="/admin" />}
  actions={<HeaderButton variant="ghost">Settings</HeaderButton>}
/>
```

---

## Tracking collapsed state

The component emits collapse-state changes through `onCollapsedChange`.

```tsx
<Header
  onCollapsedChange={(collapsed) => {
    console.log('Header collapsed:', collapsed)
  }}
/>
```

The callback fires only when the boolean state actually changes.

---

## Hiding navigation while collapsed

`hideNavOnCollapse` is enabled by default. When the header becomes collapsed, the internal navigation region fades and becomes non-interactive.

```tsx
<Header
  hideNavOnCollapse
  navigation={
    <HeaderNav>
      <HeaderNavItem href="/products">Products</HeaderNavItem>
      <HeaderNavItem href="/company">Company</HeaderNavItem>
    </HeaderNav>
  }
/>
```

Set it to `false` to keep navigation visible even in the collapsed header.

```tsx
<Header hideNavOnCollapse={false} />
```

The internal navigation wrapper is hidden below the `md` breakpoint by the component styles. For mobile navigation, render a menu trigger inside `actions`, or provide your own mobile-specific UI through `children`.

---

## Logo usage

### Interactive logo

```tsx
<HeaderLogo href="/" icon={<span aria-hidden="true">◆</span>} text="Vewave" />
```

### Static logo

Use `href={null}` to render a non-interactive `<span>` instead of a link.

```tsx
<HeaderLogo href={null} text="Preview mode" />
```

### Custom logo content

```tsx
<HeaderLogo href="/">
  <span className="font-black">VV</span>
  <span className="text-sm opacity-80">Vewave Studio</span>
</HeaderLogo>
```

---

## Navigation usage

```tsx
<HeaderNav>
  <HeaderNavItem href="/">Home</HeaderNavItem>
  <HeaderNavItem href="/rooms" active>
    Rooms
  </HeaderNavItem>
  <HeaderNavItem href="/billing" disabled>
    Billing
  </HeaderNavItem>
</HeaderNav>
```

### `HeaderNavItem`

`HeaderNavItem` supports:

- active state with `active`;
- disabled state with `disabled`;
- navigation sizing through `size` values defined by `headerNavItemVariants`.

When disabled, the item:

- removes its effective `href`;
- prevents click navigation;
- becomes unfocusable with `tabIndex={-1}`;
- receives `aria-disabled`.

---

## Button usage

```tsx
<HeaderButton>Get started</HeaderButton>
<HeaderButton variant="outline">Learn more</HeaderButton>
<HeaderButton variant="ghost">Sign in</HeaderButton>
```

### Loading state

```tsx
<HeaderButton loading>Saving</HeaderButton>
```

The button becomes disabled and exposes `aria-busy`.

### Icons

```tsx
<HeaderButton
  startIcon={<span aria-hidden="true">＋</span>}
  endIcon={<span aria-hidden="true">→</span>}
>
  Create room
</HeaderButton>
```

### Icon-only button

```tsx
<HeaderButton size="icon" aria-label="Open profile menu">
  ☰
</HeaderButton>
```

An accessible label is recommended for icon-only buttons.

---

## Slot composition

`Header` exposes four content areas:

```tsx
<Header
  logo={...}
  navigation={...}
  actions={...}
>
  Optional custom trailing content
</Header>
```

The `children` slot is rendered after the built-in `actions` slot inside the header inner layout.

---

## Slot class overrides

Use `slotClassNames` to customize internal regions without rewriting the component.

```tsx
<Header
  slotClassNames={{
    inner: 'gap-4',
    logo: 'mr-2',
    navigation: 'justify-end',
    actions: 'gap-3',
    children: 'hidden lg:block',
  }}
/>
```

Available slots:

```ts
slotClassNames?: {
  inner?: string
  logo?: string
  navigation?: string
  actions?: string
  children?: string
}
```

The exact exported type comes from `HeaderSlotClassNames`.

---

## Motion and animation controls

```tsx
<Header motionPreset="spring" smoothScrollMotion showGlow glowColor="rgba(99, 102, 241, 0.38)" />
```

The exact available `motionPreset` values are defined by `HeaderMotionPreset` in `./types` and the matching presets in `./config`.

`Header` automatically respects the user's reduced-motion preference via Motion's `useReducedMotion`.

---

## Visual customization

```tsx
<Header
  variant="glass"
  size="lg"
  blurIntensity="lg"
  borderRadiusExpanded={24}
  borderRadiusCollapsed={999}
  topOffset={16}
  showGlow
/>
```

The complete allowed values for `variant`, `size`, `position`, and `blurIntensity` are defined in `./types`.

---

## Ref usage in React 19

The component follows React 19 ref-as-prop style.

```tsx
'use client'

import { useRef } from 'react'
import { Header } from '@/components/header'

export function HeaderWithRef() {
  const headerRef = useRef<HTMLElement>(null)

  return <Header ref={headerRef} />
}
```

The same pattern applies to:

- `HeaderNav`
- `HeaderNavItem`
- `HeaderLogo`
- `HeaderButton`
- `HeaderSpacer`

---

## Data attributes

The root header exposes useful state attributes:

```txt
data-slot="premium-header"
data-state="expanded" | "collapsed"
data-hidden="true" | "false"
data-variant="..."
```

These attributes can be used for custom styling, tests, or state-aware selectors.

Example:

```css
[data-slot='premium-header'][data-state='collapsed'] {
  backdrop-filter: blur(24px);
}
```

---

## Accessibility notes

The component includes a few accessibility-oriented behaviors out of the box:

- the internal navigation region receives `aria-label` through `navigationLabel`;
- active navigation items use `aria-current="page"`;
- disabled navigation items expose `aria-disabled` and cannot be activated;
- loading buttons expose `aria-busy`;
- glow decoration is marked with `aria-hidden="true"`;
- hidden-on-scroll headers become visible again when focus enters the header.

When using icon-only actions, provide an `aria-label`.

---

## Practical recipe: polished marketing header

```tsx
'use client'

import {
  HeaderButton,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderSpacer,
  Header,
} from '@/components/header'

export function LandingHeader() {
  return (
    <>
      <Header
        variant="glass"
        size="lg"
        initialWidth="min(94vw, 76rem)"
        collapsedWidth="min(68vw, 48rem)"
        maxWidth="76rem"
        scrollDistance={220}
        collapseThreshold={0.58}
        hideOnScrollDown
        revealAtTop={32}
        showGlow
        logo={<HeaderLogo text="Vewave" href="/" />}
        navigation={
          <HeaderNav>
            <HeaderNavItem href="#features">Features</HeaderNavItem>
            <HeaderNavItem href="#workflow">Workflow</HeaderNavItem>
            <HeaderNavItem href="#pricing">Pricing</HeaderNavItem>
          </HeaderNav>
        }
        actions={
          <>
            <HeaderButton variant="ghost">Log in</HeaderButton>
            <HeaderButton>Start free</HeaderButton>
          </>
        }
      />

      <HeaderSpacer size="lg" topOffset={12} />
    </>
  )
}
```

---

## Practical recipe: dashboard header with manual collapse

```tsx
'use client'

import { useState } from 'react'
import { HeaderButton, HeaderLogo, Header } from '@/components/header'

export function DashboardHeader() {
  const [compact, setCompact] = useState(false)

  return (
    <Header
      variant="glass"
      collapseBehavior="manual"
      collapsed={compact}
      hideNavOnCollapse={false}
      initialWidth="min(96vw, 88rem)"
      collapsedWidth="min(72vw, 56rem)"
      logo={<HeaderLogo text="Studio" href="/studio" />}
      actions={
        <HeaderButton variant="outline" onClick={() => setCompact((value) => !value)}>
          {compact ? 'Expand header' : 'Compact header'}
        </HeaderButton>
      }
    />
  )
}
```

---

## Exported styling helpers

The module also exports variant builders for external composition:

```ts
export { HeaderVariants, headerButtonVariants, headerNavItemVariants }
```

Use them when you need a separate element to visually match the header system.

---

## Summary

Use `Header` when you need a polished, reusable top-level header with animated collapse behavior and slot-based composition.

A good default setup is:

```tsx
<Header
  logo={<HeaderLogo text="Brand" href="/" />}
  navigation={<HeaderNav>{/* items */}</HeaderNav>}
  actions={<HeaderButton>Action</HeaderButton>}
/>
<HeaderSpacer />
```

Use manual collapse for state-driven UI, `hideOnScrollDown` for content-heavy pages, `slotClassNames` for project-level adjustments, and `HeaderSpacer` whenever the header is positioned above page content.
