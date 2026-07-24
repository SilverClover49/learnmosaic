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

  const newCollections = [
    {
      name: 'profiles',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true, max: 200 },
        { name: 'age', type: 'number', required: true },
        { name: 'aiProvider', type: 'text', max: 50 },
        { name: 'aiModel', type: 'text', max: 100 },
        { name: 'apiKey', type: 'text', max: 500 },
        { name: 'baseUrl', type: 'text', max: 500 },
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
        { name: 'blocks', type: 'json' },
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
    },
    {
      name: 'memories',
      type: 'base',
      fields: [
        { name: 'sessionId', type: 'text', required: true, max: 100 },
        { name: 'type', type: 'text', required: true, max: 50 },
        { name: 'key', type: 'text', required: true, max: 200 },
        { name: 'value', type: 'text', required: true, max: 10000 },
        { name: 'importance', type: 'number' },
        { name: 'created', type: 'autodate', system: true, onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', system: true, onCreate: true, onUpdate: true }
      ]
    },
    {
      name: 'artifacts',
      type: 'base',
      fields: [
        { name: 'sessionId', type: 'text', required: true, max: 100 },
        { name: 'type', type: 'text', required: true, max: 50 },
        { name: 'name', type: 'text', required: true, max: 200 },
        { name: 'content', type: 'text', max: 500000 },
        { name: 'mimeType', type: 'text', max: 100 },
        { name: 'created', type: 'autodate', system: true, onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', system: true, onCreate: true, onUpdate: true }
      ]
    },
    {
      name: 'settings',
      type: 'base',
      fields: [
        { name: 'aiProvider', type: 'text', max: 50 },
        { name: 'aiModel', type: 'text', max: 100 },
        { name: 'apiKey', type: 'text', max: 500 },
        { name: 'baseUrl', type: 'text', max: 500 },
        { name: 'updated', type: 'autodate', system: true, onCreate: true, onUpdate: true }
      ]
    }
  ]

  // Get existing collections
  let existing
  try { existing = await api('/api/collections', { headers }) } catch { existing = { items: [] } }
  const existingNames = existing.items.map(c => c.name)

  for (const col of newCollections) {
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

  // Migration: add blocks field to messages if missing
  const msgCol = existing.items.find(c => c.name === 'messages')
  if (msgCol && !msgCol.fields.find(f => f.name === 'blocks')) {
    console.log('Adding "blocks" field to messages collection...')
    const fields = [...msgCol.fields, { name: 'blocks', type: 'json', system: false }]
    await api(`/api/collections/messages`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields })
    })
    console.log('Added blocks field to messages')
  }

  // Migration: add settings fields to existing profiles
  const profilesCol = existing.items.find(c => c.name === 'profiles')
  if (profilesCol) {
    const profileFields = profilesCol.fields.map(f => f.name)
    const newProfileFields = [...profilesCol.fields]
    for (const f of [{ name: 'aiProvider', type: 'text', max: 50 }, { name: 'aiModel', type: 'text', max: 100 }, { name: 'apiKey', type: 'text', max: 500 }, { name: 'baseUrl', type: 'text', max: 500 }]) {
      if (!profileFields.includes(f.name)) {
        newProfileFields.push(f)
        console.log(`Adding "${f.name}" to profiles`)
      }
    }
    if (newProfileFields.length > profilesCol.fields.length) {
      await api(`/api/collections/profiles`, { method: 'PATCH', headers, body: JSON.stringify({ fields: newProfileFields }) })
    }
  }

  // Migration: add memories + artifacts collections if they don't exist
  const memoriesCol = existing.items.find(c => c.name === 'memories')
  if (!memoriesCol) {
    console.log('Creating memories collection...')
    const mc = newCollections.find(c => c.name === 'memories')
    if (mc) await api('/api/collections', { method: 'POST', headers, body: JSON.stringify(mc) })
  }
  const artifactsCol = existing.items.find(c => c.name === 'artifacts')
  if (!artifactsCol) {
    console.log('Creating artifacts collection...')
    const ac = newCollections.find(c => c.name === 'artifacts')
    if (ac) await api('/api/collections', { method: 'POST', headers, body: JSON.stringify(ac) })
  }

  // Migration: add settings collection if it doesn't exist
  const settingsCol = existing.items.find(c => c.name === 'settings')
  if (!settingsCol) {
    console.log('Creating settings collection...')
    const sc = newCollections.find(c => c.name === 'settings')
    if (sc) {
      try {
        await api('/api/collections', { method: 'POST', headers, body: JSON.stringify(sc) })
      } catch (e) {
        if (e.message?.includes('name_exists')) {
          console.log('Settings collection already exists — skipping')
        } else {
          throw e
        }
      }
    }
  } else {
    console.log('Collection "settings" exists — skipping')
  }

  console.log('PocketBase schema setup complete!')
  console.log(`Admin UI: ${PB_URL}/_/`)
}

setup().catch(console.error)
