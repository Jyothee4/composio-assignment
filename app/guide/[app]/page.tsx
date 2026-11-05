import { Suspense } from 'react'
import GuideClient from './GuideClient'

export default async function GuidePage({
  params,
}: {
  params: Promise<{ app: string }>
}) {
  const { app } = await params
  const appName = decodeURIComponent(app)

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700">Loading guide...</p>
          </div>
        </div>
      }
    >
      <GuideClient appName={appName} />
    </Suspense>
  )
}
