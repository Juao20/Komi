import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { downloadCsvExport } from '@/features/backoffice/api'
import { Button } from '@/shared/components/ui/button'
import { getApiErrorMessage } from '@/shared/services/api-client'

export function ExportCsvButton({
  path,
  params,
  filename,
}: {
  path: string
  params: Record<string, string | number | undefined>
  filename: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await downloadCsvExport(path, params, filename)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d'exporter les données."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      <Download />
      {loading ? 'Export…' : 'Exporter CSV'}
    </Button>
  )
}
