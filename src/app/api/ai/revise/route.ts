import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

type Action = 'tighten' | 'pacing' | 'sound_like_chapter'

interface ReviseRequest {
  action: Action
  selectedText: string
  referenceChapterContent?: string
}

function buildPrompt(body: ReviseRequest): string {
  switch (body.action) {
    case 'tighten':
      return `Tighten the following prose. Remove redundancy, cut weak words, preserve the author's voice. Return ONLY the revised text, no commentary.\n\n---\n${body.selectedText}`
    case 'pacing':
      return `Analyze the pacing of the following passage. Is it too fast, too slow, or well-balanced? Point to 2-3 specific sentences as examples. Be concise.\n\n---\n${body.selectedText}`
    case 'sound_like_chapter':
      return `Rewrite the following passage to match the voice, tone, and sentence rhythm of the reference text below. Return ONLY the rewritten passage, no commentary.\n\nREFERENCE:\n${body.referenceChapterContent ?? ''}\n\nPASSAGE TO REWRITE:\n${body.selectedText}`
  }
}

export async function POST(req: Request) {
  try {
    const body: ReviseRequest = await req.json()

    if (!body.selectedText || body.selectedText.length > 4000) {
      return Response.json({ error: 'Selected text must be between 1 and 4000 characters.' }, { status: 400 })
    }

    const validActions: Action[] = ['tighten', 'pacing', 'sound_like_chapter']
    if (!validActions.includes(body.action)) {
      return Response.json({ error: 'Invalid action.' }, { status: 400 })
    }

    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'

    const message = await client.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(body) }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''
    return Response.json({ result })
  } catch (err) {
    return Response.json({ error: 'AI request failed.' }, { status: 500 })
  }
}
