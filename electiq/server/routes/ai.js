import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Helper: safely parse JSON with fallback
export function safeParseJSON(text, fallback = []) {
  if (!text) return fallback;
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Gemini JSON parse failed, returning fallback');
    return fallback;
  }
}

// Helper: strip markdown fences Gemini sometimes adds around JSON
const cleanJson = (text) => text.replace(/```json/g, '').replace(/```/g, '').trim();

// Helper: safely call Gemini – returns null instead of throwing
async function safeGenerate(model, prompt) {
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

  // Read key per-request (lazy) so missing key at startup doesn't crash the module
  const apiKey = process.env.VITE_GEMINI_API_KEY || '';

  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY not set – returning fallback data');
    // Return fallback instead of 500 so the UI doesn't crash
    return res.json({
      explainer: `Election data for ${name} is currently unavailable. Please configure the Gemini API key on the server.`,
      steps: [{ n: 1, title: 'Data Unavailable', desc: 'Please try again later.', date: 'TBD' }],
      quiz: [],
      facts: ['Elections are the foundation of democracy.', 'Voter participation shapes election outcomes.', 'Election laws vary across countries.']
    });
  }

  try {
    // Create Gemini client with the live key (lazy, per-request)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Run all four prompts in parallel for speed
    const [explainerText, stepsText, quizText, factsText] = await Promise.all([
      safeGenerate(model, `You are a non-partisan civic education expert.
Explain how elections work in ${name} in 5 clear sentences.
Cover: type of government, voting system, who can vote, term length, and one unique fact.
Write in simple English suitable for a first-time voter.
Return plain text only, no markdown.`),

      safeGenerate(model, `List the 6 key steps of the election process in ${name}.
Return ONLY a valid JSON array, no markdown, no explanation:
[
  { "n": 1, "title": "Step title", "desc": "Step description", "date": "When this happens" }
]`),

      safeGenerate(model, `Create 3 multiple choice quiz questions about elections in ${name}.
Return ONLY a valid JSON array, no markdown:
[
  { "q": "Question?", "opts": ["A", "B", "C", "D"], "ans": 0 }
]
ans is the index (0-3) of the correct answer.`),

      safeGenerate(model, `Give 3 surprising facts about elections or democracy in ${name}.
Return ONLY a valid JSON array, nothing else:
[ "fact 1", "fact 2", "fact 3" ]`)
    ]);

    // Build response — use fallbacks for any failed Gemini call
    const explainer = explainerText
      || `${name} has a democratic election system. More details are currently unavailable.`;

    const steps = safeParseJSON(stepsText, [
      { n: 1, title: 'Data Loading', desc: 'Election process data is updating.', date: 'TBD' }
    ]);

    const quiz = safeParseJSON(quizText, []);

    const facts = safeParseJSON(factsText, [
      'Elections are a cornerstone of democracy.',
      'Voter participation drives election outcomes.',
      'Election laws vary widely across countries.'
    ]);

    console.log(`✅ /api/country/${name} – responding with full data`);
    res.json({ explainer, steps, quiz, facts });

  } catch (error) {
    // Last-resort catch – still return JSON, never a raw 500
    console.error('Unexpected error in /api/country route:', error?.message || error);
    res.json({
      explainer: `Election information for ${name} is temporarily unavailable.`,
      steps: [],
      quiz: [],
      facts: ['Elections are the foundation of democracy.', 'Voter participation shapes outcomes.', 'Election rules vary by country.']
    });
  }
});

export default router;