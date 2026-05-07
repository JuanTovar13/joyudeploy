type CheckInAnswers = Record<string, string>

export type GroqRecommendation = {
  message: string
  activity: string
}

export async function getRecommendation(answers: CheckInAnswers): Promise<GroqRecommendation> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    console.error('[Groq] VITE_GROQ_API_KEY is not set. Restart the dev server after adding it to .env')
    throw new Error('Missing VITE_GROQ_API_KEY')
  }

  const prompt = `You are an emotional well-being assistant for university students.

Based on the following student responses, do TWO things:

1. Write ONE short, warm, and motivating sentence in English (maximum 20 words).
   It should feel like a personalized inspirational message, not medical advice.

2. Recommend EXACTLY ONE option from this list:
   - Individual sports
   - Team sports
   - Musical arts (Groups)
   - Short workshops
   - Musical arts (Classes)
   - Performing arts
   - Visual arts
   - Physical activity and health
   - Schedule an appointment with a psychologist

Student responses:
- Emotional state this week: ${answers.emotion}
- Main source of pressure: ${answers.pressure}
- Daily hours of sleep: ${answers.sleep}
- Preferred relaxation activity: ${answers.relax}
- What they need most right now: ${answers.need}

Reply ONLY with a valid JSON object in this exact format, no extra text:
{
  "message": "<motivating sentence>",
  "activity": "<one option from the list above, copied exactly>"
}`

  console.log('[Groq] Sending request...')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[Groq] API error:', response.status, errText)
    throw new Error(`Groq API responded with ${response.status}: ${errText}`)
  }

  const data = await response.json()
  console.log('[Groq] Raw response:', data)

  const raw = data?.choices?.[0]?.message?.content?.trim()
  if (!raw) {
    console.error('[Groq] Empty content in response:', data)
    throw new Error('Groq returned an empty response')
  }

  let parsed: GroqRecommendation
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.error('[Groq] Failed to parse JSON:', raw)
    throw new Error('Groq response was not valid JSON')
  }

  if (!parsed.message || !parsed.activity) {
    console.error('[Groq] Missing fields in response:', parsed)
    throw new Error('Groq response missing required fields')
  }

  console.log('[Groq] Recommendation:', parsed)
  return parsed
}
