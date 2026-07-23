import 'dotenv/config'

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@learnmosaic.io'
const ADMIN_PASS = process.env.PB_ADMIN_PASS || 'LearnMosaic2026!'

async function api(path, opts = {}) {
  const { headers: extraHeaders, ...rest } = opts
  const res = await fetch(`${PB_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data
}

async function setup() {
  console.log('Setting up PocketBase schema...')

  // Get admin token
  const auth = await api('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  })
  const token = auth.token
  console.log('Authenticated as superuser')
  const headers = { Authorization: `Bearer ${token}` }

  const collections = [
    {
      name: 'profiles',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true, max: 200 },
        { name: 'age', type: 'number', required: true },
        { name: 'created', type: 'autodate', system: true, onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', system: true, onCreate: true, onUpdate: true }
      ]
    },
    {
      name: 'sessions',
      type: 'base',
      fields: [
        { name: 'profileId', type: 'text', required: true, max: 100 },
        { name: 'name', type: 'text', required: true, max: 200 },
        { name: 'age', type: 'number', required: true },
        { name: 'interests', type: 'json' },
        { name: 'goal', type: 'text', required: true, max: 5000 },
        { name: 'timeframe', type: 'text', max: 200 },
        { name: 'status', type: 'text', max: 50 },
        { name: 'materials', type: 'json' },
        { name: 'curriculum', type: 'text', max: 100000 },
        { name: 'thinkingBoard', type: 'text', max: 100000 },
        { name: 'checklist', type: 'text', max: 100000 },
        { name: 'completedAt', type: 'text', max: 100 },
        { name: 'chatCount', type: 'number' },
        { name: 'favorite', type: 'bool' },
        { name: 'reviewCards', type: 'text', max: 10000 },
        { name: 'created', type: 'autodate', system: true, onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', system: true, onCreate: true, onUpdate: true }
      ]
    },
    {
      name: 'messages',
      type: 'base',
      fields: [
        { name: 'sessionId', type: 'text', required: true, max: 100 },
        { name: 'role', type: 'text', required: true, max: 50 },
        { name: 'content', type: 'text', required: true, max: 100000 },
        { name: 'created', type: 'autodate', system: true, onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', system: true, onCreate: true, onUpdate: true }
      ]
    },
    {
      name: 'milestones',
      type: 'base',
      fields: [
        { name: 'sessionId', type: 'text', required: true, max: 100 },
        { name: 'type', type: 'text', required: true, max: 100 },
        { name: 'description', type: 'text', required: true, max: 5000 },
        { name: 'created', type: 'autodate', system: true, onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', system: true, onCreate: true, onUpdate: true }
      ]
    }
  ]

  // Get existing collections
  let existing
  try { existing = await api('/api/collections', { headers }) } catch { existing = { items: [] } }
  const existingNames = existing.items.map(c => c.name)

  for (const col of collections) {
    if (existingNames.includes(col.name)) {
      console.log(`Collection "${col.name}" exists — skipping`)
    } else {
      console.log(`Creating collection "${col.name}"`)
      await api('/api/collections', {
        method: 'POST',
        headers,
        body: JSON.stringify(col)
      })
    }
  }

  console.log('PocketBase schema setup complete!')
  console.log(`Admin UI: ${PB_URL}/_/`)
}

setup().catch(console.error)
