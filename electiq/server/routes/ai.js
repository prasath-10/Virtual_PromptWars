import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const apiKey = process.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.get('/country/:name', async (req, res) => {
  const { name } = req.params;
  console.log(`GET /api/country/${name} hit`);

  try {
    const explainerPrompt = `You are a non-partisan civic education expert.
Explain how elections work in ${name} in 5 clear sentences.
Cover: type of government, voting system, who can vote, term length, and one unique fact.
Write in simple English suitable for a first-time voter.
Return plain text only, no markdown.`;
    const explainerResult = await model.generateContent(explainerPrompt);
    const explainer = explainerResult.response.text();

    const stepsPrompt = `List the 6 key steps of the election process in ${name}.
Return ONLY a valid JSON array, no markdown, no explanation:
[
  { "n": 1, "title": "...", "desc": "...", "date": "..." },
  ...
]`;
    const stepsResult = await model.generateContent(stepsPrompt);

    const cleanJson = (text) => {
      return text.replace(/```json/g, '').replace(/```/g, '').trim();
    };

    let steps = [];
    try {
      steps = JSON.parse(cleanJson(stepsResult.response.text()));
    } catch (e) {
      console.error('Failed to parse steps:', e);
      steps = [{ n: 1, title: "Process Loading", desc: "The election process is being updated.", date: "TBD" }];
    }

    const quizPrompt = `Create 3 multiple choice quiz questions about elections in ${name}.
Return ONLY a valid JSON array, no markdown:
[
  { "q": "...", "opts": ["...", "...", "...", "..."], "ans": 0 },
  ...
]
ans is the index of the correct answer (0-3).`;
    const quizResult = await model.generateContent(quizPrompt);
    let quiz = [];
    try {
      quiz = JSON.parse(cleanJson(quizResult.response.text()));
    } catch (e) {
      console.error('Failed to parse quiz:', e);
      quiz = [];
    }

    const factsPrompt = `Give 3 surprising facts about elections or democracy in ${name}.
Return ONLY a valid JSON array:
[ "fact 1", "fact 2", "fact 3" ]`;
    const factsResult = await model.generateContent(factsPrompt);
    let facts = [];
    try {
      facts = JSON.parse(cleanJson(factsResult.response.text()));
    } catch (e) {
      console.error('Failed to parse facts:', e);
      facts = ["Democratic processes are unique here.", "Voter engagement is a key priority.", "Election systems are evolving."];
    }

    res.json({ explainer, steps, quiz, facts });

  } catch (error) {
    console.error('Error fetching data from Gemini:', error);
    res.status(500).json({ error: 'Failed to fetch country data' });
  }
});

export default router;
