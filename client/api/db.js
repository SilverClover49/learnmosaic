import { createClient } from '@libsql/client'

const TURSO_URL = 'https://learnmosaic-storage40.aws-us-east-1.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODc1ODcxNzYsImlhdCI6MTc4NDk5NTE3NiwiaWQiOiIwMTlmOWEwMC00ZTAxLTdlNTAtYjNhOS0yZjI0NzUyNzc1ZWIiLCJraWQiOiJtbmZ1b09mU0l3a3RpOTUwZ3hsWlhCZ19nU0tpNHllX01LS1g5Z1VzbHBrIiwicmlkIjoiOWRiMmE3YzAtM2U3OC00YWQ5LThmNGYtNjY3MDVlNGJkOWQ0In0.TbJ53ySLFh61pKvO__1dX5W0AdF67gvJVTMXg6AxoLlv25kFxBmAl4sSscWyQYGZu38iirUb0Irj584IUGwHCw'

export const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
})

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}
