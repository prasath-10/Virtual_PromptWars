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
    let stepsText = stepsResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const steps = JSON.parse(stepsText);

    const quizPrompt = `Create 3 multiple choice quiz questions about elections in ${name}.
Return ONLY a valid JSON array, no markdown:
[
  { "q": "...", "opts": ["...", "...", "...", "..."], "ans": 0 },
...
]
ans is the index of the correct answer (0-3).`;
    const quizResult = await model.generateContent(quizPrompt);
    let quizText = quizResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const quiz = JSON.parse(quizText);

    const factsPrompt = `Give 3 surprising facts about elections or democracy in ${name}.
Return ONLY a valid JSON array:
[ "fact 1", "fact 2", "fact 3" ]`;
    const factsResult = await model.generateContent(factsPrompt);
    let factsText = factsResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const facts = JSON.parse(factsText);

    res.json({ explainer, steps, quiz, facts });

  } catch (error) {
    console.error('Error fetching data from Gemini:', error);
    res.status(500).json({ error: 'Failed to fetch country data' });
  }
});
});

export default router;
