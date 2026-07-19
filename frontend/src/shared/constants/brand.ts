export const BRAND = {
  name: 'KOMI',
  tagline: 'La plateforme e-commerce pensée pour l’Afrique',
  logos: {
    primary: '/assets/logos/logo-primary.svg',
    horizontal: '/assets/logos/logo-horizontal.svg',
    icon: '/assets/logos/logo-icon.svg',
    white: '/assets/logos/logo-white.svg',
    black: '/assets/logos/logo-black.svg',
    comy: '/assets/logos/comy-icon.svg',
  },
  social: {
    og: '/assets/social/og-image.png',
    twitter: '/assets/social/twitter-card.png',
  },
} as const

export type LogoVariant = keyof typeof BRAND.logos
