import { searchWeb, searchImages } from './search.js'
import { generateImage } from './imagegen.js'

export const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Search the web for current information on any topic',
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
      description: 'Search for images related to a topic',
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
      description: 'Generate an SVG diagram, chart, or illustration. Output raw SVG code only.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Raw SVG code' },
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
      description: 'Generate an image using DALL-E. Only use if the user explicitly asks for an AI-generated image.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Image description prompt' }
        },
        required: ['prompt']
      }
    }
  }
]

export async function executeToolCall(toolCall) {
  const { name, arguments: args } = toolCall.function
  const parsed = JSON.parse(args)

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
        content: `SVG generated for: ${parsed.description}`,
        tool_call_id: toolCall.id,
        block: { type: 'svg', code: parsed.code, description: parsed.description }
      }
    }
    case 'generate_image': {
      const imageUrl = await generateImage(parsed.prompt)
      if (!imageUrl) {
        return {
          role: 'tool',
          content: 'Failed to generate image (out of credits or API error)',
          tool_call_id: toolCall.id
        }
      }
      return {
        role: 'tool',
        content: imageUrl,
        tool_call_id: toolCall.id,
        block: { type: 'image', url: imageUrl, prompt: parsed.prompt }
      }
    }
    default:
      return {
        role: 'tool',
        content: `Unknown tool: ${name}`,
        tool_call_id: toolCall.id
      }
  }
}

export async function executeToolCalls(toolCalls) {
  return Promise.all(toolCalls.map(executeToolCall))
}
