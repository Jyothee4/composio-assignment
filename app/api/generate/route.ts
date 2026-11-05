import { NextRequest } from 'next/server'
import { generateGuide } from '@/lib/agent'
import { getGuideFromLibrary } from '@/lib/library'

export async function POST(req: NextRequest) {
  const { appName, domain, forceLive } = await req.json()

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
        // Check pre-verified library first unless user explicitly forced live search
        const libraryGuide = !forceLive ? getGuideFromLibrary(appName) : null

        if (libraryGuide) {
          send({ type: 'progress', message: `Checking verified library for "${appName}"...` })
          await new Promise((r) => setTimeout(r, 350))
          send({
            type: 'progress',
            message: `Found verified specification: Tier ${libraryGuide.difficulty} (${libraryGuide.difficulty_label}).`,
          })
          await new Promise((r) => setTimeout(r, 350))
          send({
            type: 'progress',
            message: `Loaded ${libraryGuide.steps.length} setup steps, ${libraryGuide.known_blockers.length} blockers, and official sources.`,
          })
          await new Promise((r) => setTimeout(r, 300))
          send({ type: 'result', guide: libraryGuide })
          controller.close()
          return
        }

        // Live investigation flow
        if (!process.env.EXA_API_KEY && !process.env.GEMINI_API_KEY) {
          send({
            type: 'error',
            message:
              'Live web search requires EXA_API_KEY and GEMINI_API_KEY in your .env.local file. You can test the showcased apps (GitHub, Notion, Slack, Google, Salesforce) from the library immediately!',
          })
          controller.close()
          return
        }

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
