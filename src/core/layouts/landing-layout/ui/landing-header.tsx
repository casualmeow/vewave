import { useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { headerItems } from '../config'
import { Header, HeaderButton, HeaderLogo, HeaderNav, HeaderNavItem } from '@/components/header'
import { VewaveLogoMark } from '@/shared/theme'

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
          {headerItems.map((item) => (
            <HeaderNavItem key={item.href} href={item.href}>
              {item.label}
            </HeaderNavItem>
          ))}
        </HeaderNav>
      }
      actions={
        <>
          {/*
            <HeaderButton
            variant="ghost"
            className="hidden sm:inline-flex"
            startIcon={<Play className="size-4" />}
            onClick={() => void navigate({ to: '/studio' })}
          >
            Studio
          </HeaderButton>*/}
          <HeaderButton
            endIcon={<ArrowRight className="size-4" />}
            onClick={() => navigate({ to: '/create' })}
          >
            Get started
          </HeaderButton>
        </>
      }
    />
  )
}
