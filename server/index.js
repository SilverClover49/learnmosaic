import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import usersRouter from './routes/users.js'
import sessionsRouter from './routes/sessions.js'
import documentsRouter from './routes/documents.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api/users', usersRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/documents', documentsRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`LearnMosaic server running on port ${PORT}`)
})
