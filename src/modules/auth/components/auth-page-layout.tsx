import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { SignInArtwork, SignInBrand } from './sign-in-artwork'
import type { ReactNode } from 'react'
import { GlassInteractionScope } from '@/shared/lib/glass-interaction-scope'
import './sign-in.css'

type AuthPageLayoutProps = {
  title: string
  titleId: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthPageLayout({
  title,
  titleId,
  description,
  children,
  footer,
}: AuthPageLayoutProps) {
  const plateRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  return (
    <GlassInteractionScope>
      <SignInArtwork plateRef={plateRef} formRef={formRef}>
        <div className="sign-in-composition">
          <nav className="sign-in-header" aria-label="Return navigation">
            <Link to="/" className="sign-in-back">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to home
            </Link>
          </nav>
          <main className="sign-in-plate" ref={plateRef} aria-labelledby={titleId}>
            <section className="sign-in-poster" aria-label="Watch together with Vewave">
              <SignInBrand />
              <div className="sign-in-poster-copy">
                <h2>
                  Press play,
                  <br />
                  together.
                </h2>
                <p>Watch together. Keep everything in sync.</p>
              </div>
            </section>
            <div className="sign-in-form-column" ref={formRef}>
              <div className="sign-in-form-content">
                <div className="sign-in-heading">
                  <h1 id={titleId}>{title}</h1>
                  <p>{description}</p>
                </div>
                {children}
                <p className="sign-in-register">{footer}</p>
              </div>
            </div>
          </main>
        </div>
      </SignInArtwork>
    </GlassInteractionScope>
  )
}
