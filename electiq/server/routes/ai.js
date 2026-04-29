import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Read the backend env var (no VITE_ prefix)
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is missing! Set it in Render → Environment.');
} else {
  console.log('✅ GEMINI_API_KEY loaded:', apiKey.slice(0, 6) + '…');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper: strip markdown fences Gemini sometimes adds
const cleanJson = (text) => text.replace(/```json/g, '').replace(/```/g, '').trim();

// Helper: call Gemini safely – returns null on any failure
async function safeGenerate(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini call failed:', err?.message || err);
    return null;
  }
}

// GET /api/country/:name
router.get('/country/:name', async (req, res) => {
  const { name } = req.params;
  console.log(`GET /api/country/${name} hit`);

  // Early exit if key not configured
  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API key not configured on server',
      detail: 'Add GEMINI_API_KEY to Render → Environment Variables'
    });
  }

  // Run all four Gemini calls in parallel – each is wrapped so one failure doesn't abort the others
  const [explainerText, stepsText, quizText, factsText] = await Promise.all([
    safeGenerate(
      `You are a non-partisan civic education expert.
Explain how elections work in ${name} in 5 clear sentences.
Cover: type of government, voting system, who can vote, term length, and one unique fact.
Write in simple English suitable for a first-time voter.
Return plain text only, no markdown.`
    ),
    safeGenerate(
      `List the 6 key steps of the election process in ${name}.
Return ONLY a valid JSON array, no markdown, no explanation:
[
  { "n": 1, "title": "...", "desc": "...", "date": "..." }
]`
    ),
    safeGenerate(
      `Create 3 multiple choice quiz questions about elections in ${name}.
Return ONLY a valid JSON array, no markdown:
[
  { "q": "...", "opts": ["...", "...", "...", "..."], "ans": 0 }
]
ans is the index of the correct answer (0-3).`
    ),
    safeGenerate(
      `Give 3 surprising facts about elections or democracy in ${name}.
Return ONLY a valid JSON array, nothing else:
[ "fact 1", "fact 2", "fact 3" ]`
    )
  ]);

  // Build response with fallbacks for any failed call
  const explainer = explainerText || `Election information for ${name} is currently unavailable. Please try again shortly.`;

  let steps = [];
  if (stepsText) {
    try { steps = JSON.parse(cleanJson(stepsText)); }
    catch { steps = [{ n: 1, title: 'Data Loading', desc: 'Election process data is updating.', date: 'TBD' }]; }
  }

  let quiz = [];
  if (quizText) {
    try { quiz = JSON.parse(cleanJson(quizText)); }
    catch { quiz = []; }
  }

  let facts = [];
  if (factsText) {
    try { facts = JSON.parse(cleanJson(factsText)); }
    catch { facts = ['Elections are a cornerstone of democracy.', 'Voter participation drives election outcomes.', 'Election laws vary widely across countries.']; }
  }

  res.json({ explainer, steps, quiz, facts });
});

export default router;