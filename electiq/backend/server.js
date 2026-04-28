import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/api/country/:name', async (req, res) => {
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

app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.VITE_GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-D',
            ssmlGender: 'MALE'
          },
          audioConfig: { audioEncoding: 'MP3' }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`TTS API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json({ audioContent: data.audioContent });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
