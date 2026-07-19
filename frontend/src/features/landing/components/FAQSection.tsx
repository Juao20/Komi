import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion'

const FAQS = [
  {
    question: 'Ai-je besoin de compétences techniques pour utiliser KOMI ?',
    answer: 'Non. KOMI est conçu pour être utilisé sans aucune connaissance technique. Si vous savez utiliser WhatsApp, vous saurez utiliser KOMI.',
  },
  {
    question: 'Combien de temps faut-il pour créer ma boutique ?',
    answer: 'Moins de 5 minutes. Renseignez le nom, le secteur et les couleurs de votre boutique, et elle est créée automatiquement.',
  },
  {
    question: 'Puis-je utiliser KOMI si je vends déjà sur WhatsApp ou TikTok ?',
    answer: 'Oui, c\'est exactement pour cela que KOMI a été conçu. Continuez à vendre sur vos réseaux, et utilisez KOMI pour centraliser vos commandes, produits et statistiques.',
  },
  {
    question: 'Quels moyens de paiement sont disponibles ?',
    answer: 'KOMI prend en charge le paiement à la livraison dès aujourd\'hui. Le Mobile Money et la carte bancaire arrivent très prochainement.',
  },
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord.',
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Questions fréquentes</h2>
      </div>

      <Accordion type="single" collapsible className="mt-10">
        {FAQS.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
