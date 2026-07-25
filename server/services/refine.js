import { callAI } from './openrouter.js'
import { getSettings } from './settings.js'

const sessions = new Map()

const STRUCTURED_QUESTIONS = [
  {
    dimension: 'area',
    question: (goal) => `What area of "${goal}" would you like to focus on?`,
    options: (goal, interests, history) => {
      const g = (history[0]?.a || goal || '').toLowerCase()
      if (g.includes('web') || g.includes('website') || g.includes('frontend') || g.includes('backend'))
        return ['Frontend Development', 'Backend Development', 'Full Stack', 'Web Design / UX', 'Other (type your own)']
      if (g.includes('mobile') || g.includes('app') || g.includes('ios') || g.includes('android'))
        return ['iOS (Swift)', 'Android (Kotlin)', 'Cross-Platform (Flutter/React Native)', 'Mobile Web (PWA)', 'Other (type your own)']
      if (g.includes('data') || g.includes('machine learning') || g.includes('ai'))
        return ['Data Analysis', 'Machine Learning', 'Deep Learning', 'Data Engineering', 'Other (type your own)']
      if (g.includes('game'))
        return ['Unity (C#)', 'Unreal Engine (C++)', 'Godot', 'Web Games', 'Other (type your own)']
      return ['Web Development', 'Mobile Apps', 'Data Science / AI', 'Game Development', 'Other (type your own)']
    },
    aiOptions: true
  },
  {
    dimension: 'experience',
    question: () => 'What is your experience level with this?',
    options: () => ['Complete Beginner', 'Some Basics', 'Intermediate', 'Advanced']
  },
  {
    dimension: 'style',
    question: () => 'How do you prefer to learn?',
    options: () => ['Hands-on Projects', 'Video Tutorials', 'Reading / Docs', 'Interactive Exercises', 'Mix of Everything']
  },
  {
    dimension: 'pace',
    question: () => 'How would you like to pace yourself?',
    options: () => ['Intensive (daily)', 'Moderate (few times/week)', 'Flexible (when I can)', 'Other (type your own)']
  }
]

function buildCurriculumPrompt(goal, interests, history) {
  const context = history.map(h => `Q: ${h.q}\nAnswer: ${h.a}`).join('\n')
  return `Based on this student's profile, generate a personalized 4-week curriculum.

Student goal: ${goal}
Interests: ${interests?.join(', ') || 'Not specified'}
Conversation:
${context}

Output JSON:
{
  "refinedGoal": "A precise 1-sentence goal combining all their answers",
  "curriculum": "Week 1: ...\nWeek 2: ...\nWeek 3: ...\nWeek 4: ...",
  "checklist": "- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n- [ ] Task 4\n- [ ] Task 5"
}`
}

export async function startRefinement(goal, interests) {
  if (!goal || goal.trim().length < 2) {
    return { error: 'Please enter a more specific learning goal' }
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const q = STRUCTURED_QUESTIONS[0]

  const questionText = q.question(goal, interests)
  const optionsList = q.options(goal, interests, [])

  sessions.set(id, {
    goal,
    interests,
    history: [],
    step: 1,
    totalSteps: STRUCTURED_QUESTIONS.length
  })

  return {
    sessionId: id,
    question: questionText,
    options: optionsList,
    step: 1,
    totalSteps: STRUCTURED_QUESTIONS.length,
    complete: false
  }
}

export async function answerRefinement(sessionId, answer) {
  const session = sessions.get(sessionId)
  if (!session) return { error: 'Session expired or invalid. Please start again.' }

  const settings = await getSettings()

  if (answer === '__back__') {
    if (session.history.length > 0) {
      session.history.pop()
      session.step = Math.max(1, session.step - 1)
    }
    const q = STRUCTURED_QUESTIONS[Math.max(0, session.step - 1)]
    return {
      sessionId,
      question: q.question(session.goal, session.interests),
      options: q.options(session.goal, session.interests, session.history),
      step: session.step,
      totalSteps: session.totalSteps,
      complete: false
    }
  }

  const lastQuestion = session.history.length > 0
    ? session.history[session.history.length - 1].q
    : STRUCTURED_QUESTIONS[0].question(session.goal, session.interests)

  session.history.push({ q: lastQuestion, a: answer })

  if (session.step >= session.totalSteps) {
    const fallback = {
      refinedGoal: session.history.map(h => h.a).join(' - '),
      curriculum: 'Week 1: Foundations\nWeek 2: Core Concepts\nWeek 3: Practice\nWeek 4: Project',
      checklist: '- [ ] Complete Week 1\n- [ ] Complete Week 2\n- [ ] Complete Week 3\n- [ ] Complete Week 4'
    }

    try {
      const result = await callAI({
        system: 'You are a curriculum designer. Create detailed, actionable learning plans. Output only valid JSON.',
        messages: [{ role: 'user', content: buildCurriculumPrompt(session.goal, session.interests, session.history) }],
        settings
      })
      const parsed = JSON.parse(result.content)
      fallback.refinedGoal = parsed.refinedGoal || fallback.refinedGoal
      fallback.curriculum = parsed.curriculum || fallback.curriculum
      fallback.checklist = parsed.checklist || fallback.checklist
    } catch (e) {
      console.error('Curriculum generation failed, using fallback:', e.message)
    }

    sessions.delete(sessionId)
    return { complete: true, ...fallback }
  }

  const nextStep = session.step
  const q = STRUCTURED_QUESTIONS[nextStep]

  let questionText = q.question(session.goal, session.interests)
  let optionsList = q.options(session.goal, session.interests, session.history)

  if (q.aiOptions) {
    try {
      const result = await callAI({
        system: `You are a learning advisor. Given the student's goal "${session.goal}" and interests [${(session.interests || []).join(', ')}], suggest 4 relevant learning area options. Output JSON: {"options": ["option1", "option2", "option3", "option4"]}`,
        messages: [{ role: 'user', content: `Goal: ${session.goal}\nInterests: ${(session.interests || []).join(', ')}\nSuggest 4 focused area options.` }],
        settings
      })
      const parsed = JSON.parse(result.content)
      if (parsed.options && parsed.options.length >= 3) {
        optionsList = [...parsed.options.slice(0, 4), 'Other (type your own)']
      }
    } catch (e) {
      console.error('AI option generation failed, using defaults:', e.message)
    }
  }

  session.step++

  return {
    sessionId,
    question: questionText,
    options: optionsList,
    step: session.step,
    totalSteps: session.totalSteps,
    complete: false
  }
}
