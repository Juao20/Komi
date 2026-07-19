import { Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { sendBuyerChatMessage } from '@/features/ai/api'
import type { PublicStore } from '@/features/storefront/types'
import { ComyIcon } from '@/shared/components/ComyIcon'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn'
import { getContrastColor } from '@/shared/utils/color'

interface ChatEntry {
  role: 'user' | 'assistant'
  content: string
}

function getSessionKey(storeSlug: string): string {
  const key = `komi-comy-session-${storeSlug}`
  let sessionKey = localStorage.getItem(key)
  if (!sessionKey) {
    sessionKey = crypto.randomUUID()
    localStorage.setItem(key, sessionKey)
  }
  return sessionKey
}

export function ComyBuyerWidget({ store }: { store: PublicStore }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contrast = getContrastColor(store.primary_color)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending])

  const handleSend = async (question: string) => {
    if (!question.trim() || isSending) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setIsSending(true)
    try {
      const sessionKey = getSessionKey(store.slug)
      const { answer } = await sendBuyerChatMessage(store.slug, question, sessionKey)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Désolée, je n'ai pas pu répondre. Réessayez." }])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-high sm:right-6">
          <div className="flex items-center justify-between border-b border-border px-4 py-3" style={{ backgroundColor: store.primary_color }}>
            <div className="flex items-center gap-2" style={{ color: contrast }}>
              <ComyIcon className="size-4" />
              <span className="text-sm font-semibold">Comy · {store.name}</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: contrast }}>
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bonjour ! Je suis Comy, je peux vous aider à trouver un produit dans cette boutique.
              </p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-secondary px-3.5 py-2">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleSend(input)
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Cherchez un produit…"
              disabled={isSending}
              className="text-sm"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isSending} style={{ backgroundColor: store.primary_color, color: contrast }}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-4 z-40 flex size-14 items-center justify-center rounded-full shadow-elevation-high transition-transform hover:scale-105 sm:right-6"
        style={{ backgroundColor: store.primary_color, color: contrast }}
        aria-label="Ouvrir Comy"
      >
        {open ? <X className="size-5" /> : <ComyIcon className="size-6" />}
      </button>
    </>
  )
}
