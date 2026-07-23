import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const promptsDir = path.join(__dirname, '..', 'prompts')
const cache = new Map()

export async function loadPrompt(name) {
  if (cache.has(name)) return cache.get(name)
  const content = await fs.readFile(path.join(promptsDir, name), 'utf-8')
  cache.set(name, content)
  return content
}
