import { NextRequest } from 'next/server'
import { generateGuide } from '@/lib/agent'

export async function POST(req: NextRequest) {
  const { appName, domain } = await req.json()

  if (!appName) {
    return new Response(JSON.stringify({ error: 'appName is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stream progress updates + final result
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const guide = await generateGuide(appName, domain, (step: string) => {
          send({ type: 'progress', message: step })
        })
        send({ type: 'result', guide })
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
