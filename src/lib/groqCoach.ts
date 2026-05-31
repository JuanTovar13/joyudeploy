export type StudyAnalysis = {
  diagnosis:   string   // 1-2 sentences: honest snapshot of their current state
  highlight:   string   // what they are doing well
  alert:       string   // what needs attention (or a positive note if nothing critical)
  next_action: string   // one concrete, specific thing to do right now
}

export interface StudyContext {
  totalTasks:              number
  completedTasks:          number
  pendingTasks:            { title: string; estimated_pomodoros: number; completed_pomodoros: number }[]
  totalGoalPomodoros:      number
  completedPomodorosToday: number
  focusMinutesToday:       number
  sessionsToday:           number
  consecutiveWorkSkips:    number
  skippedTaskTitle:        string | null   // active task when skips happened
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama-3.3-70b-versatile'

export const getStudyAnalysis = async (ctx: StudyContext): Promise<StudyAnalysis> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('Missing VITE_GROQ_API_KEY')

  const pendingList = ctx.pendingTasks.length > 0
    ? ctx.pendingTasks
        .map(t => `   - "${t.title}" (${t.completed_pomodoros}/${t.estimated_pomodoros} pomodoros)`)
        .join('\n')
    : '   (no pending tasks)'

  const prompt = `You are an empathetic study coach for university students. \
Analyze the student's current state and reply ONLY with valid JSON.

Student data for today:
- Total tasks: ${ctx.totalTasks}
- Completed tasks: ${ctx.completedTasks}
- Pending tasks:
${pendingList}
- Pomodoros completed today: ${ctx.completedPomodorosToday} / ${ctx.totalGoalPomodoros} total
- Focus minutes today: ${ctx.focusMinutesToday}
- Work sessions today: ${ctx.sessionsToday}
${ctx.consecutiveWorkSkips >= 2
  ? `- IMPORTANT: The student has skipped the work session ${ctx.consecutiveWorkSkips} times in a row${ctx.skippedTaskTitle ? ` on the task "${ctx.skippedTaskTitle}"` : ''}. They may be blocked, unmotivated, or struggling with that task.`
  : ''}

Reply ONLY with this JSON (no extra text):
{
  "diagnosis": "<1-2 honest sentences about the student's current state>",
  "highlight": "<one specific thing they are doing well>",
  "alert": "<one thing that needs attention, or positive reinforcement if everything looks good>",
  "next_action": "<one specific, concrete action they should take right now>"
}`

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Groq API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content?.trim()
  if (!raw) throw new Error('Groq returned an empty response')

  const parsed = JSON.parse(raw) as StudyAnalysis
  if (!parsed.diagnosis || !parsed.next_action) throw new Error('Groq response missing fields')
  return parsed
}
