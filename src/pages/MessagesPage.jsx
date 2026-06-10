/**
 * pages/MessagesPage.jsx
 *
 * Dedicated public page for messages to Maximiliano.
 */

import { useEffect } from 'react'
import useStore from '@/store/index.js'
import MessagesSection from '@/components/participant/MessagesSection.jsx'
import { Spinner } from '@/components/ui/index.jsx'

export default function MessagesPage() {
  const { loading, error, loadAll } = useStore()

  useEffect(() => { loadAll() }, [loadAll])

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500 text-sm">Error: {error}</div>
  }

  return <MessagesSection />
}
