import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'

import type { PublicStore } from '@/features/storefront/types'

export function StorefrontFooter({ store }: { store: PublicStore }) {
  const socialLinks = [
    store.social_instagram && { label: 'Instagram', href: `https://instagram.com/${store.social_instagram.replace('@', '')}` },
    store.social_facebook && { label: 'Facebook', href: store.social_facebook },
    store.social_tiktok && { label: 'TikTok', href: `https://tiktok.com/@${store.social_tiktok.replace('@', '')}` },
    store.social_whatsapp && { label: 'WhatsApp', href: `https://wa.me/${store.social_whatsapp.replace(/\D/g, '')}` },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="font-semibold">{store.name}</p>
        {store.description && <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{store.description}</p>}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {store.phone_number && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" />
              {store.phone_number}
            </span>
          )}
          {store.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {store.email}
            </span>
          )}
          {store.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {store.city}
            </span>
          )}
        </div>

        {store.theme.show_social_links && socialLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {link.label}
                <ExternalLink className="size-3" />
              </a>
            ))}
          </div>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          Propulsé par <span className="font-medium text-foreground">KOMI</span>
        </p>
      </div>
    </footer>
  )
}
