import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useVerifyEmail } from '@/features/auth/hooks'
import { Button } from '@/shared/components/ui/button'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const verifyEmail = useVerifyEmail()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const uid = searchParams.get('uid')
    const token = searchParams.get('token')
    if (uid && token) {
      verifyEmail.mutate({ uid, token })
    }
  }, [searchParams, verifyEmail])

  if (verifyEmail.isSuccess) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Email confirmé</h1>
        <p className="mt-2 text-sm text-muted-foreground">Votre adresse email a été vérifiée avec succès.</p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Continuer</Link>
        </Button>
      </div>
    )
  }

  if (verifyEmail.isError) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Lien invalide</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce lien de vérification est invalide ou a expiré.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/dashboard">Retour au tableau de bord</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Vérification de votre email…</p>
    </div>
  )
}
