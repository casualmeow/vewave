import { createLink, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { headerRouteItems } from '../config'
import { Header, HeaderButton, HeaderLogo, HeaderNav, HeaderNavItem } from '@/components/header'
import { VewaveLogoMark } from '@/shared/theme'

const HeaderNavLink = createLink(HeaderNavItem)

export function LandingHeader() {
  const navigate = useNavigate()

  return (
    <Header
      variant="glassDark"
      size="lg"
      initialWidth="min(94vw, 76rem)"
      collapsedWidth="min(72vw, 46rem)"
      minWidth="min(92vw, 22rem)"
      maxWidth="76rem"
      scrollDistance={220}
      collapseThreshold={0.58}
      topOffset={16}
      blurIntensity="xl"
      showGlow
      revealAtTop={32}
      navigationLabel="Landing"
      logo={
        <HeaderLogo
          href="/"
          icon={<VewaveLogoMark decorative surfaceToken="header" />}
          text="Vewave"
        />
      }
      navigation={
        <HeaderNav>
          {headerRouteItems.map((item) => (
            <HeaderNavLink key={item.href} to={item.href}>
              {item.label}
            </HeaderNavLink>
          ))}
        </HeaderNav>
      }
      actions={
        <HeaderButton
          endIcon={<ArrowRight className="size-4" />}
          onClick={() => navigate({ to: '/create' })}
        >
          Get started
        </HeaderButton>
      }
    />
  )
}
