import { callAI } from './openrouter.js'
import { getSettings } from './settings.js'

const sessions = new Map()

const TOPICS = ['Web Development', 'Mobile Apps', 'Data Science', 'Game Development', 'AI / Machine Learning', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'Other (type your own)']
const LEVELS = ['Complete Beginner', 'Some Basics', 'Intermediate', 'Advanced']
const STYLES = ['Hands-on Projects', 'Video Tutorials', 'Reading / Docs', 'Interactive Exercises', 'Mix of Everything']

function generateOptions(topic) {
  const map = {
    'Web Development': ['Frontend (HTML/CSS/JS)', 'Backend (Node/Python)', 'Full Stack', 'React / Vue / Angular', 'Other (type your own)'],
    'Mobile Apps': ['iOS (Swift)', 'Android (Kotlin)', 'Cross-Platform (React Native/Flutter)', 'Other (type your own)'],
    'Data Science': ['Python & Pandas', 'SQL & Databases', 'Machine Learning', 'Data Visualization', 'Other (type your own)'],
    'Game Development': ['Unity (C#)', 'Unreal (C++)', 'Godot', 'Web Games', 'Other (type your own)'],
    'AI / Machine Learning': ['LLMs & Prompt Engineering', 'Deep Learning', 'Computer Vision', 'NLP', 'Other (type your own)'],
    'Cybersecurity': ['Ethical Hacking', 'Network Security', 'Cryptography', 'Security Auditing', 'Other (type your own)'],
    'Cloud Computing': ['AWS', 'Azure', 'Google Cloud', 'Docker / Kubernetes', 'Other (type your own)'],
    'DevOps': ['CI/CD Pipelines', 'Infrastructure as Code', 'Monitoring & Logging', 'Git & Version Control', 'Other (type your own)']
  }
  return map[topic] || ['General', 'Specialized', 'Practical Focus', 'Theory Focus', 'Other (type your own)']
}

function buildSystemPrompt(goal, interests, history) {
  const context = history.map(h => `Q: ${h.q}\nA: ${h.a}`).join('\n')
  const interestsText = interests?.length ? `\nStudent's interests: ${interests.join(', ')}` : ''
  return `You are a learning advisor helping a student refine their goal: "${goal}"${interestsText}

${context ? `Conversation so far:\n${context}\n\n` : ''}Based on what you know, ask ONE focused question to narrow down their goal. Use the student's interests to personalize questions. Choose from the following dimensions in order:
1. What broad area? (only if not yet specified — prefer suggesting areas related to their interests)
2. What specific sub-field? (only after area is known)
3. What experience level?
4. What learning style?

Output JSON:
{
  "question": "the question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Other (type your own)"],
  "step": 1,
  "totalSteps": 4,
  "complete": false
}

When you have enough info (after ~3-4 rounds), output:
{
  "complete": true,
  "refinedGoal": "a precise goal combining all answers",
  "curriculum": "A 4-point curriculum plan with milestones"
}`
}

export async function startRefinement(goal, interests) {
  if (!goal || goal.trim().length < 2) {
    return { error: 'Please enter a more specific learning goal' }
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const settings = await getSettings()
  const history = []

  const result = await callAI({
    system: buildSystemPrompt(goal, interests, history),
    messages: [{ role: 'user', content: `Help me refine my goal: ${goal}${interests?.length ? `\nMy interests: ${interests.join(', ')}` : ''}` }],
    settings
  })

  let parsed
  try {
    parsed = JSON.parse(result.content)
  } catch {
    parsed = {
      question: 'What area are you most interested in?',
      options: TOPICS,
      step: 1,
      totalSteps: 4,
      complete: false
    }
  }

  sessions.set(id, { goal, interests, history, step: 1 })
  return { sessionId: id, question: parsed.question, options: parsed.options || TOPICS, step: 1, totalSteps: 4, complete: false }
}

export async function answerRefinement(sessionId, answer) {
  const session = sessions.get(sessionId)
  if (!session) return { error: 'Session expired or invalid. Please start again.' }

  const settings = await getSettings()

  if (answer === '__back__') {
    session.history.pop()
    session.step = Math.max(1, session.step - 1)
  } else {
    const lastQuestion = session.history.length > 0
      ? session.history[session.history.length - 1].q
      : 'What area are you most interested in?'
    session.history.push({ q: lastQuestion, a: answer })
  }

  if (session.step >= 4) {
    const context = session.history.map(h => `${h.q}\nAnswer: ${h.a}`).join('\n')
    const curriculumPrompt = `Based on this student's profile, generate a personalized 4-week curriculum.

Student goal: ${session.goal}
Interests: ${session.interests?.join(', ') || 'Not specified'}
Details:
${context}

Output JSON:
{
  "refinedGoal": "A precise 1-sentence goal",
  "curriculum": "Week 1: ...\nWeek 2: ...\nWeek 3: ...\nWeek 4: ...",
  "checklist": "- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n- [ ] Task 4\n- [ ] Task 5"
}`

    let parsed = {
      refinedGoal: session.history.map(h => h.a).join(' - '),
      curriculum: 'Week 1: Foundations\nWeek 2: Core Concepts\nWeek 3: Practice\nWeek 4: Project',
      checklist: '- [ ] Complete Week 1\n- [ ] Complete Week 2\n- [ ] Complete Week 3\n- [ ] Complete Week 4'
    }

    try {
      const result = await callAI({
        system: 'You are a curriculum designer. Create detailed, actionable learning plans.',
        messages: [{ role: 'user', content: curriculumPrompt }],
        settings
      })
      parsed = JSON.parse(result.content)
    } catch (e) {
      console.error('Curriculum generation failed, using fallback:', e.message)
    }

    sessions.delete(sessionId)
    return { complete: true, refinedGoal: parsed.refinedGoal, curriculum: parsed.curriculum, checklist: parsed.checklist }
  }

  let parsed
  try {
    const result = await callAI({
      system: buildSystemPrompt(session.goal, session.interests, session.history),
      messages: [{ role: 'user', content: `Student's goal: ${session.goal}\n\nContinue refining.` }],
      settings
    })
    parsed = JSON.parse(result.content)
  } catch (e) {
    console.error('Refinement question generation failed:', e.message)
    const dimension = session.step === 2 ? 'experience level' : 'learning style'
    const opts = session.step === 2 ? LEVELS : STYLES
    parsed = {
      question: `What's your ${dimension}?`,
      options: opts,
      step: session.step,
      totalSteps: 4,
      complete: false
    }
  }

  if (parsed.complete) {
    session.step = 4
    const context = session.history.map(h => `${h.q}\nAnswer: ${h.a}`).join('\n')
    const curriculumPrompt = `Based on this student's profile, generate a personalized 4-week curriculum.

Student goal: ${session.goal}
Interests: ${session.interests?.join(', ') || 'Not specified'}
Details:
${context}

Output JSON:
{
  "refinedGoal": "A precise 1-sentence goal",
  "curriculum": "Week 1: ...\nWeek 2: ...\nWeek 3: ...\nWeek 4: ...",
  "checklist": "- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n- [ ] Task 4\n- [ ] Task 5"
}`

    let curParsed = {
      refinedGoal: session.history.map(h => h.a).join(' - '),
      curriculum: 'Week 1: Foundations\nWeek 2: Core Concepts\nWeek 3: Practice\nWeek 4: Project',
      checklist: '- [ ] Complete Week 1\n- [ ] Complete Week 2\n- [ ] Complete Week 3\n- [ ] Complete Week 4'
    }

    try {
      const curResult = await callAI({
        system: 'You are a curriculum designer. Create detailed, actionable learning plans.',
        messages: [{ role: 'user', content: curriculumPrompt }],
        settings
      })
      curParsed = JSON.parse(curResult.content)
    } catch (e) {
      console.error('Curriculum generation failed (path 2), using fallback:', e.message)
    }

    sessions.delete(sessionId)
    return {
      complete: true,
      refinedGoal: curParsed.refinedGoal || session.goal,
      curriculum: curParsed.curriculum,
      checklist: curParsed.checklist
    }
  }

  session.step++
  session.history[session.history.length - 1].asked = 'new'

  return {
    sessionId,
    question: parsed.question,
    options: parsed.options,
    step: session.step,
    totalSteps: 4,
    complete: false
  }
}
