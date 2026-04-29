import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ✅ Fix 1: Use backend env var name (no VITE_ prefix)
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is missing! AI routes will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ Fix 2: Helper to clean JSON responses
const cleanJson = (text) => text.replace(/```json/g, '').replace(/```/g, '').trim();

// ✅ Fix 3: Moved route to /country/:name (matches app.use('/api', aiRouter))
router.get('/country/:name', async (req, res) => {
  const { name } = req.params;
  console.log(`GET /api/country/${name} hit`);

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
  }

  try {
    // ✅ Fix 4: Run all Gemini calls in parallel (faster, not sequential)
    const [explainerResult, stepsResult, quizResult, factsResult] = await Promise.all([
      model.generateContent(`You are a non-partisan civic education expert.
Explain how elections work in ${name} in 5 clear sentences.
Cover: type of government, voting system, who can vote, term length, and one unique fact.
Write in simple English suitable for a first-time voter.
Return plain text only, no markdown.`),

      model.generateContent(`List the 6 key steps of the election process in ${name}.
Return ONLY a valid JSON array, no markdown, no explanation:
[
  { "n": 1, "title": "...", "desc": "...", "date": "..." }
]`),

      model.generateContent(`Create 3 multiple choice quiz questions about elections in ${name}.
Return ONLY a valid JSON array, no markdown:
[
  { "q": "...", "opts": ["...", "...", "...", "..."], "ans": 0 }
]
ans is the index of the correct answer (0-3).`),

      model.generateContent(`Give 3 surprising facts about elections or democracy in ${name}.
Return ONLY a valid JSON array:
[ "fact 1", "fact 2", "fact 3" ]`)
    ]);

    // Parse explainer (plain text)
    const explainer = explainerResult.response.text();

    // Parse steps (JSON)
    let steps = [];
    try {
      steps = JSON.parse(cleanJson(stepsResult.response.text()));
    } catch (e) {
      console.error('Failed to parse steps:', e);
      steps = [{ n: 1, title: "Process Loading", desc: "The election process is being updated.", date: "TBD" }];
    }

    // Parse quiz (JSON)
    let quiz = [];
    try {
      quiz = JSON.parse(cleanJson(quizResult.response.text()));
    } catch (e) {
      console.error('Failed to parse quiz:', e);
      quiz = [];
    }

    // Parse facts (JSON)
    let facts = [];
    try {
      facts = JSON.parse(cleanJson(factsResult.response.text()));
    } catch (e) {
      console.error('Failed to parse facts:', e);
      facts = [
        "Democratic processes are unique here.",
        "Voter engagement is a key priority.",
        "Election systems are evolving."
      ];
    }

    res.json({ explainer, steps, quiz, facts });

  } catch (error) {
    console.error('Gemini API error:', error?.message || error);
    res.status(500).json({
      error: 'Failed to fetch country data',
      detail: error?.message || 'Unknown error'
    });
  }
});

export default router;