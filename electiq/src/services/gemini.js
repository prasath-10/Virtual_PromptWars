import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
// Use gemini-1.5-flash for fast responses
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getElectionExplainer(countryName) {
  const prompt = `You are a non-partisan civic education expert.
Explain how elections work in ${countryName} in 5 clear sentences.
Cover: type of government, voting system, who can vote, term length, and one unique fact.
Write in simple English suitable for a first-time voter.
Return plain text only, no markdown.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function getElectionSteps(countryName) {
  const prompt = `List the 6 key steps of the election process in ${countryName}.
Return ONLY a valid JSON array, no markdown, no explanation:
[
  { "n": 1, "title": "...", "desc": "...", "date": "..." },
  ...
]`;
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}

export async function getElectionQuiz(countryName) {
  const prompt = `Create 3 multiple choice quiz questions about elections in ${countryName}.
Return ONLY a valid JSON array, no markdown:
[
  { "q": "...", "opts": ["...", "...", "...", "..."], "ans": 0 },
  ...
]
ans is the index of the correct answer (0-3).`;
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}

export async function getElectionFacts(countryName) {
  const prompt = `Give 3 surprising facts about elections or democracy in ${countryName}.
Return ONLY a valid JSON array:
[ "fact 1", "fact 2", "fact 3" ]`;
  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}
