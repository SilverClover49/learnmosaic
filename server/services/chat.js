import { callAI, streamAI } from './openrouter.js'
import { toolDefinitions, executeToolCalls } from './tools.js'
import { recallMemories, storeMemory, updateSessionSummary } from './memory.js'
import { listArtifacts } from './artifacts.js'
import { getSettings } from './settings.js'
import { pb } from './pb.js'
import { loadPrompt } from './prompts.js'

function formatDuration(secs) {
  if (!secs || secs < 60) return `${secs || 0}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  if (m < 60) return `${m}m${s > 0 ? ` ${s}s` : ''}`
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`
}

function getTimeOfDay(now) {
  const h = now.getHours()
  return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 21 ? 'evening' : 'night'
}

async function buildSystemPrompt(meta, message, sessionId, now, sessionDuration) {
  const [memories, artifacts, tutorPrompt, toolsPrompt] = await Promise.all([
    recallMemories(sessionId, message),
    listArtifacts(sessionId),
    loadPrompt('tutor.md'),
    loadPrompt('tools.md')
  ])

  const memoryContext = memories.length > 0
    ? `\n\n## What I Remember About This Student\n${memories.map(m => `- ${m.key}: ${m.value}`).join('\n')}`
    : ''

  const artifactContext = artifacts.length > 0
    ? `\n\n## Session Artifacts\n${artifacts.map(a => `- ${a.name} (${a.type})`).join('\n')}`
    : ''

  const ageNum = meta.age != null ? Number(meta.age) : null
  const toneInstruction = ageNum !== null && ageNum < 18
    ? '\n\n## Tone & Communication Style\nThe student is a young learner. Use a warm, encouraging, and patient tone. Simplify explanations when needed. Use analogies and examples. Be supportive and positive. Avoid overwhelming them with too much information at once.'
    : ''

  const materials = meta.materials || []
  const materialContext = materials.length > 0
    ? `\n\n## Student-Provided Materials\nThese materials were provided by the student and should be treated as the PRIMARY reference — ~70% of your responses should draw from or reference these materials:\n${materials.map((m, i) => `\n### Material ${i + 1}: ${typeof m === 'string' ? m : m.name || 'Unnamed'}\n${typeof m === 'string' ? '' : `Type: ${m.type || 'unknown'}\nSize: ${m.size || 'unknown'}`}`).join('\n')}\n\n**Important**: Center your teaching around these materials. Use external knowledge only to supplement or clarify what the student has provided.`
    : ''

  return (tutorPrompt + toneInstruction + materialContext + '\n\n' + toolsPrompt + memoryContext + artifactContext)
    .replace(/{name}/g, meta.name)
    .replace(/{age}/g, ageNum != null ? String(ageNum) : 'unknown')
    .replace(/{interests}/g, (meta.interests || []).join(', '))
    .replace(/{goal}/g, meta.goal)
    .replace(/{sub_goal}/g, meta.subGoal || '')
    .replace(/{timeframe}/g, meta.timeframe || 'flexible')
    .replace(/{curriculum_summary}/g, (meta.curriculum || '').slice(0, 800))
    .replace(/{checklist}/g, meta.checklist || '')
    .replace(/{current_date_time}/g, now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }))
    .replace(/{time_of_day}/g, getTimeOfDay(now))
    .replace(/{session_duration}/g, formatDuration(sessionDuration || 0))
    .replace(/{message_time}/g, now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
}

async function extractFacts(sessionId, message, response, settings) {
  try {
    const extractionPrompt = `Extract 1-3 key facts about the student or session from this exchange:\n\nStudent: ${message.slice(0, 500)}\nTutor: ${response.slice(0, 500)}\n\nFor each fact, output a line:\nKEY: <fact key>\nVALUE: <fact value>\nIMPORTANCE: <1-10>\n\nOnly output facts that are genuinely important to remember.`
    const factResult = await callAI({
      system: 'You extract structured facts from educational conversations. Output only the format specified.',
      messages: [{ role: 'user', content: extractionPrompt }],
      settings
    })
    const content = factResult.content || ''
    const lines = content.split('\n').filter(l => l.trim())
    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i]?.startsWith('KEY:') && lines[i + 1]?.startsWith('VALUE:')) {
        const key = lines[i].replace('KEY:', '').trim()
        const value = lines[i + 1].replace('VALUE:', '').trim()
        const importance = parseInt(lines[i + 2]?.replace('IMPORTANCE:', '').trim()) || 5
        if (key && value) await storeMemory(sessionId, 'fact', key, value, importance)
      }
    }
  } catch {} // silent — best-effort
}

async function persistChat(sessionId, message, response, blocks, meta, now, settings) {
  const cleanText = response.replace(/\[MILESTONE:[^\]]*\]/g, '').trim()
  const botMsg = cleanText || response

  // Persist messages
  await pb.createMessage({ sessionId, role: 'user', content: message })
  await pb.createMessage({ sessionId, role: 'assistant', content: botMsg, blocks: blocks || [] })

  // Check for milestone
  const milestoneMatch = response.match(/\[MILESTONE:\s*(.*?)\]/)
  if (milestoneMatch) {
    await pb.addMilestone({ sessionId, type: 'achievement', description: milestoneMatch[1].trim() })
  }

  // Update thinking board
  const boardEntry = `\n## ${now.toLocaleString()}\n\n**Student**: ${message.slice(0, 200)}\n\n**Tutor**: ${botMsg.slice(0, 300)}...\n\n---\n`
  const updatedBoard = (meta.thinkingBoard || '') + boardEntry
  const newCount = (meta.chatCount || 0) + 1

  if (newCount > 0 && newCount % 5 === 0) {
    try {
      const summaryPrompt = await loadPrompt('summarize.md')
      const boardSummary = await callAI({
        system: summaryPrompt,
        messages: [{ role: 'user', content: updatedBoard.slice(-3000) }],
        settings
      })
      const summaryText = boardSummary.content || ''
      await pb.updateSession(sessionId, {
        thinkingBoard: `# Thinking Board (Summarized)\n\n${summaryText}\n\n---\n${boardEntry}`,
        chatCount: newCount
      })
      await updateSessionSummary(sessionId, summaryText)
    } catch {
      await pb.updateSession(sessionId, { thinkingBoard: updatedBoard, chatCount: newCount })
    }
  } else {
    await pb.updateSession(sessionId, { thinkingBoard: updatedBoard, chatCount: newCount })
  }

  // Extract facts every 3 messages (not every message — saves tokens)
  if (newCount % 3 === 0) {
    await extractFacts(sessionId, message, botMsg, settings)
  }
}

export async function handleChat(req, res) {
  const { message, history, currentTime, sessionDuration } = req.body

  let meta
  try { meta = await pb.getSession(req.params.id) } catch {}
  if (!meta) return res.status(404).json({ error: 'Session not found' })

  const sessionId = req.params.id
  const now = currentTime ? new Date(currentTime) : new Date()
  const settings = await getSettings()

  // Build system prompt with memory & artifact context (in parallel)
  const system = await buildSystemPrompt(meta, message, sessionId, now, sessionDuration)
  const aiMessages = (history || []).concat([{ role: 'user', content: message }])

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const sendSSE = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  let finalText = ''
  let blocks = []
  let toolCallBuffers = null
  let hasToolCalls = false

  try {
    // First streaming call
    for await (const event of streamAI({ system, messages: aiMessages, tools: toolDefinitions, settings })) {
      if (event.type === 'token') {
        finalText += event.text
        sendSSE({ type: 'token', text: event.text })
      }
      if (event.type === 'tool_call_chunk') {
        hasToolCalls = true
        if (!toolCallBuffers) toolCallBuffers = {}
        if (!toolCallBuffers[event.index]) {
          toolCallBuffers[event.index] = { id: event.id, type: 'function', function: { name: '', arguments: '' } }
        }
        if (event.function?.name) toolCallBuffers[event.index].function.name += event.function.name
        if (event.function?.arguments) toolCallBuffers[event.index].function.arguments += event.function.arguments
      }
      if (event.type === 'done') break
    }

    // Execute tools if called (sequentially, not parallel)
    if (hasToolCalls && toolCallBuffers) {
      const toolCalls = Object.values(toolCallBuffers).map(tc => ({
        id: tc.id, type: tc.type,
        function: { name: tc.function.name, arguments: tc.function.arguments }
      }))

      const toolResults = await executeToolCalls(toolCalls, sessionId, settings)
      blocks = toolResults.filter(r => r.block).map(r => r.block)

      const toolMessages = [
        ...aiMessages,
        { role: 'assistant', content: null, tool_calls: toolCalls },
        ...toolResults.map(r => ({
          role: 'tool', content: r.content, tool_call_id: r.tool_call_id
        }))
      ]

      // Stream follow-up response
      for await (const event of streamAI({ system, messages: toolMessages, tools: toolDefinitions, settings })) {
        if (event.type === 'token') {
          finalText += event.text
          sendSSE({ type: 'token', text: event.text })
        }
        if (event.type === 'done') break
      }
    }

    // Send blocks + done
    if (blocks.length > 0) {
      sendSSE({ type: 'blocks', blocks })
    }
    sendSSE({ type: 'done' })
    res.end()

    // Persist after streaming completes
    await persistChat(sessionId, message, finalText, blocks, meta, now, settings)
  } catch (e) {
    sendSSE({ type: 'error', text: e.message })
    res.end()
  }
}
