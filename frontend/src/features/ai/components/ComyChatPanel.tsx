import { Loader2, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useChatHistory, useSendChatMessage } from '@/features/ai/hooks'
import { ComyIcon } from '@/shared/components/ComyIcon'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn'

const SUGGESTIONS = ['Comment vont mes ventes ce mois-ci ?', 'Quels produits sont en rupture de stock ?', 'Qui sont mes meilleurs clients ?']

export function ComyChatPanel() {
  const { data: history, isPending } = useChatHistory()
  const sendMessage = useSendChatMessage()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [history, sendMessage.isPending])

  const handleSend = (question: string) => {
    if (!question.trim() || sendMessage.isPending) return
    setInput('')
    sendMessage.mutate(question.trim())
  }

  const messages = history ?? []

  return (
    <Card className="flex h-[560px] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10">
            <ComyIcon className="size-3.5" />
          </span>
          Comy
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden pt-0">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {isPending ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                Bonjour, je suis Comy ✨ Posez-moi une question sur votre boutique.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.public_id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl bg-secondary px-4 py-2.5">
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
          className="mt-3 flex gap-2 border-t border-border pt-3"
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Posez une question à Comy…"
            disabled={sendMessage.isPending}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || sendMessage.isPending}>
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
