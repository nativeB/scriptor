import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedEntry } from '@/types'

const client = new Anthropic()

const VALID_TYPES = new Set(['character', 'location', 'term', 'faction'])

const SYSTEM_PROMPT = `You are a careful literary analyst. Read the text provided and extract every distinct named entity that belongs to one of these four categories:

- character: a named person, creature, or sentient being
- location: a named place, region, building, or realm
- term: a coined word, concept, magic system, technology, or in-world phrase that needs defining
- faction: a named group, organization, army, religion, or political body

Rules:
1. Only extract entities that are clearly named — skip unnamed roles like "the guard" or "a village".
2. For each entity, provide a concise description (1–2 sentences) based solely on what the text reveals. Do not invent information.
3. Aliases are other names or titles the text uses for the same entity. Leave the array empty if none appear.
4. Return ONLY a valid JSON object — no markdown fences, no commentary, nothing before or after the JSON.

Return this exact structure:
{"entries":[{"type":"character","name":"...","aliases":["..."],"description":"..."}]}`

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return Response.json({ error: 'No text provided.' }, { status: 400 })
    }

    if (body.text.length > 20000) {
      return Response.json({ error: 'Text must be 20,000 characters or fewer.' }, { status: 400 })
    }

    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'

    const message = await client.messages.create({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: body.text }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    let parsed: { entries: ExtractedEntry[] }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return Response.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 500 })
    }

    if (!Array.isArray(parsed?.entries)) {
      return Response.json({ error: 'AI response missing entries array.' }, { status: 500 })
    }

    // Sanitize — drop any entries with missing/invalid fields
    const entries: ExtractedEntry[] = parsed.entries
      .filter(
        (e) =>
          e &&
          typeof e.name === 'string' &&
          e.name.trim() &&
          VALID_TYPES.has(e.type) &&
          typeof e.description === 'string'
      )
      .map((e) => ({
        type: e.type,
        name: e.name.trim(),
        aliases: Array.isArray(e.aliases) ? e.aliases.filter((a) => typeof a === 'string' && a.trim()) : [],
        description: e.description.trim(),
      }))

    return Response.json({ entries })
  } catch {
    return Response.json({ error: 'AI request failed.' }, { status: 500 })
  }
}
