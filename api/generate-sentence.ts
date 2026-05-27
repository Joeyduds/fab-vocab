export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })
  }

  let word: string
  try {
    const body = await req.json() as { word?: string }
    word = (body.word ?? '').trim().toLowerCase()
    if (!word) throw new Error('missing word')
  } catch {
    return new Response(JSON.stringify({ error: 'Request must include { word: string }' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 80,
      messages: [{
        role: 'user',
        content: `Write ONE simple sentence for a 1st grader (age 6-7) using the word "${word}". Keep it 6-10 words, simple vocabulary, and make the word's meaning clear from context. Reply with ONLY the sentence, nothing else.`,
      }],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return new Response(JSON.stringify({ error: `Anthropic error ${res.status}: ${text}` }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }

  const data = await res.json() as { content: { text: string }[] }
  const sentence = data.content[0].text.trim()

  return new Response(JSON.stringify({ sentence }), {
    headers: { 'content-type': 'application/json' },
  })
}
