const CATEGORIES = ['Mode & Vêtements', 'Cosmétiques', 'Téléphones', 'Restaurants', 'Artisanat', 'Électronique']

export function LogosRow() {
  return (
    <section className="border-y border-border py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Utilisé par des commerçants dans tous les secteurs
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {CATEGORIES.map((category) => (
            <span key={category} className="text-sm font-medium text-muted-foreground/70">
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
