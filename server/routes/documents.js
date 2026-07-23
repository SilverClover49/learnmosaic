import { Router } from 'express'
import { callAI } from '../services/openrouter.js'

const router = Router()

router.get('/lean-canvas', async (req, res) => {
  const system = `You are a business strategist helping generate a Lean Canvas for an educational technology project.`

  const prompt = `Generate a complete Lean Canvas for "LearnMosaic" — an AI-powered personalized learning platform targeting SDG 4 (Quality Education).

## Project Description
LearnMosaic is a conversational AI tutor that creates personalized learning sessions. Students are onboarded with their name, age, interests, and goals. The AI generates a custom curriculum, dynamic checklist, and thinking board. Users can upload their own materials or the AI curates free resources. Learning happens through natural conversation with the AI, which tracks progress and celebrates milestones. At the end, students get a "credits" summary of their journey.

## Lean Canvas Format

### 1. Problem
List top 3 problems the project solves.

### 2. Customer Segments
Who are the target users?

### 3. Unique Value Proposition
What makes LearnMosaic different?

### 4. Solution
What does the product do?

### 5. Channels
How will you reach users?

### 6. Revenue Streams
How will it sustain itself?

### 7. Cost Structure
What are the major costs?

### 8. Key Metrics
What numbers measure success?

### 9. Unfair Advantage
What can't be easily copied?

Format this as a clean markdown document with a table for the Lean Canvas and detailed explanations below.`

  try {
    const content = await callAI({
      system,
      messages: [{ role: 'user', content: prompt }]
    })
    res.json({ content })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
