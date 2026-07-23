import { searchWeb, searchImages } from './search.js'
import { generateImage } from './imagegen.js'
import { storeMemory, recallMemories } from './memory.js'
import { createArtifact, listArtifacts } from './artifacts.js'

export const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web for current information on any topic. Returns snippets with source URLs.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_images',
      description: 'Search for real images related to a topic (diagrams, photos, illustrations). Use when a visual reference would help understanding.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_svg',
      description: 'Generate an SVG diagram, chart, flowchart, or illustration. Use for visual explanations: process flows, comparisons, timelines, cycles, anatomy diagrams. Output must be valid SVG with inline styling and responsive viewBox.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Raw SVG code with inline styling, responsive viewBox, fonts 14px+' },
          description: { type: 'string', description: 'What the diagram shows' }
        },
        required: ['code', 'description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate an AI image via DALL-E. Only use if the student explicitly asks for an AI-generated image.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Detailed image description' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'remember',
      description: 'Store an important fact about the student or session. Use for: student preferences, learning gaps, strengths, personal details to remember.',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Short label for this fact (e.g. struggles_with, enjoys, learning_style)' },
          value: { type: 'string', description: 'The fact itself' },
          importance: { type: 'number', description: 'Importance 1-10 (default 5)' }
        },
        required: ['key', 'value']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'recall',
      description: 'Retrieve stored facts about the student or session. Use when you need to remember something you previously learned.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'What to search for in stored memories' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_artifact',
      description: 'Create a persistent file/artifact for the session. Types: note (study notes), code (code example/simulation), presentation (slide deck), summary (review notes), exercise (practice problems). The student can view, download, and rerun these later.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the artifact (e.g. "Python Loops Cheatsheet")' },
          type: { type: 'string', enum: ['note', 'code', 'presentation', 'summary', 'exercise', 'simulation'] },
          content: { type: 'string', description: 'The content. For code: include full runnable HTML. For presentation: use --- to separate slides. For notes/exercises: markdown.' },
          mimeType: { type: 'string', description: 'MIME type (text/html, text/markdown, text/plain)' }
        },
        required: ['name', 'type', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_artifacts',
      description: 'List all saved artifacts in this session. Use to see what materials have been created.',
      parameters: {
        type: 'object',
        properties: {
          filter: { type: 'string', description: 'Optional filter by type (note, code, presentation, summary, exercise, simulation)' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_code',
      description: 'Run HTML/CSS/JS code in a sandboxed environment. Use for interactive examples, simulations, and live demonstrations. Provide complete runnable HTML.',
      parameters: {
        type: 'object',
        properties: {
          html: { type: 'string', description: 'Complete runnable HTML with embedded CSS and JS. Must be self-contained.' },
          title: { type: 'string', description: 'Title/description of what this code demonstrates' }
        },
        required: ['html', 'title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_presentation',
      description: 'Create an in-line slide presentation. Each slide is separated by ---. Use for structured lessons, topic overviews, or step-by-step guides.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Presentation title' },
          slides: { type: 'string', description: 'Slides separated by ---. Each slide can contain markdown text, code blocks, and SVG diagrams.' }
        },
        required: ['title', 'slides']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_download',
      description: 'Generate a downloadable file for the student. Use for: cheatsheets, practice worksheets, code files, study guides. The content is saved as an artifact AND offered as download.',
      parameters: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Filename with extension (e.g. "python-basics.md", "quiz.html")' },
          content: { type: 'string', description: 'File content' },
          description: { type: 'string', description: 'What this file contains' }
        },
        required: ['filename', 'content', 'description']
      }
    }
  }
]

export async function executeToolCall(toolCall, sessionId, settings = {}) {
  const { name, arguments: args } = toolCall.function
  let parsed
  try { parsed = JSON.parse(args) } catch {
    return { role: 'tool', content: `Invalid arguments for ${name}`, tool_call_id: toolCall.id }
  }

  switch (name) {
    case 'search_web': {
      const result = await searchWeb(parsed.query)
      return {
        role: 'tool',
        content: JSON.stringify(result),
        tool_call_id: toolCall.id,
        block: { type: 'search', data: result, query: parsed.query }
      }
    }
    case 'search_images': {
      const images = await searchImages(parsed.query)
      return {
        role: 'tool',
        content: JSON.stringify({ images }),
        tool_call_id: toolCall.id,
        block: { type: 'images', data: images, query: parsed.query }
      }
    }
    case 'generate_svg': {
      return {
        role: 'tool',
        content: `SVG: ${parsed.description}`,
        tool_call_id: toolCall.id,
        block: { type: 'svg', code: parsed.code, description: parsed.description }
      }
    }
    case 'generate_image': {
      const imageUrl = await generateImage(parsed.prompt, settings)
      if (!imageUrl) {
        return { role: 'tool', content: 'Image generation failed', tool_call_id: toolCall.id }
      }
      return {
        role: 'tool', content: imageUrl, tool_call_id: toolCall.id,
        block: { type: 'image', url: imageUrl, prompt: parsed.prompt }
      }
    }
    case 'remember': {
      const mem = await storeMemory(sessionId, 'fact', parsed.key, parsed.value, parsed.importance || 5)
      return { role: 'tool', content: `Stored: ${parsed.key} = ${parsed.value}`, tool_call_id: toolCall.id }
    }
    case 'recall': {
      const memories = await recallMemories(sessionId, parsed.query)
      const text = memories.length > 0
        ? memories.map(m => `${m.key}: ${m.value}`).join('\n')
        : 'No relevant memories found.'
      return {
        role: 'tool', content: text, tool_call_id: toolCall.id,
        block: { type: 'memories', data: memories, query: parsed.query }
      }
    }
    case 'create_artifact': {
      let artifact
      try {
        artifact = await createArtifact(
          sessionId, parsed.type, parsed.name,
          parsed.content, parsed.mimeType || 'text/markdown'
        )
      } catch { /* persist best-effort */ }
      return {
        role: 'tool', content: `Created artifact: ${parsed.name} (${parsed.type})`, tool_call_id: toolCall.id,
        block: { type: 'artifact', data: { id: artifact?.id || null, name: parsed.name, type: parsed.type, content: parsed.content, mimeType: parsed.mimeType || 'text/markdown' } }
      }
    }
    case 'list_artifacts': {
      const all = await listArtifacts(sessionId)
      const filtered = parsed.filter ? all.filter(a => a.type === parsed.filter) : all
      const list = filtered.map(a => `- ${a.name} (${a.type})`).join('\n') || 'No artifacts found.'
      return { role: 'tool', content: list, tool_call_id: toolCall.id }
    }
    case 'run_code': {
      return {
        role: 'tool', content: `Code sandbox: ${parsed.title}`, tool_call_id: toolCall.id,
        block: { type: 'sandbox', html: parsed.html, title: parsed.title }
      }
    }
    case 'create_presentation': {
      const slides = parsed.slides.split('---').map(s => s.trim()).filter(Boolean)
      return {
        role: 'tool', content: `Presentation: ${parsed.title} (${slides.length} slides)`, tool_call_id: toolCall.id,
        block: { type: 'presentation', title: parsed.title, slides }
      }
    }
    case 'generate_download': {
      try { await createArtifact(sessionId, 'download', parsed.filename, parsed.content, 'text/plain') } catch {}
      const blob = Buffer.from(parsed.content, 'utf-8').toString('base64')
      return {
        role: 'tool', content: `Download: ${parsed.filename}`, tool_call_id: toolCall.id,
        block: { type: 'download', filename: parsed.filename, content: parsed.content, base64: blob, description: parsed.description }
      }
    }
    default:
      return { role: 'tool', content: `Unknown tool: ${name}`, tool_call_id: toolCall.id }
  }
}

export async function executeToolCalls(toolCalls, sessionId, settings = {}) {
  const results = []
  for (const tc of toolCalls) {
    results.push(await executeToolCall(tc, sessionId, settings))
  }
  return results
}
