export async function generateSentence(correct: string): Promise<string> {
  const res = await fetch('/api/generate-sentence', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ word: correct.trim().toLowerCase() }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }

  const { sentence } = await res.json() as { sentence: string }
  return sentence
}
