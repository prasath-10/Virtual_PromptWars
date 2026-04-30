const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ── Core caller with retry logic ─────────────────────────
async function callGemini(prompt, retries = 2) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  if (!apiKey) {
    console.error('VITE_GEMINI_API_KEY is not set')
    return null
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      const data = await res.json()

      if (data.error?.code === 429) {
        console.warn(`Rate limited. Retrying in 3s... (attempt ${attempt + 1})`)
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 3000))
          continue
        }
        return null
      }

      if (data.error) {
        console.error('Gemini error:', data.error.message)
        return null
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || null

    } catch (err) {
      console.error('Gemini fetch failed:', err)
      if (attempt === retries) return null
    }
  }
  return null
}

// ── Safe JSON parser ─────────────────────────────────────
function safeParseJSON(text, fallback = []) {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

// ── 1. Election explainer ────────────────────────────────
export async function getElectionExplainer(countryName) {
  const text = await callGemini(
    `You are a non-partisan civic education expert.
     Explain how elections work in ${countryName} in 5 clear sentences.
     Cover: type of government, voting system, who can vote, term length, and one unique fact.
     Write in plain English for a first-time voter.
     Return plain text only, no markdown, no bullet points.`
  )
  return text || `Election information for ${countryName} is temporarily unavailable.`
}

// ── 2. Election steps ────────────────────────────────────
export async function getElectionSteps(countryName) {
  const text = await callGemini(
    `List the 6 key steps of the election process in ${countryName}.
     Return ONLY a valid JSON array, no markdown, no explanation, no extra text:
     [
       {"n":1,"title":"Step title","desc":"Step description","date":"Approximate timing"},
       {"n":2,"title":"Step title","desc":"Step description","date":"Approximate timing"},
       {"n":3,"title":"Step title","desc":"Step description","date":"Approximate timing"},
       {"n":4,"title":"Step title","desc":"Step description","date":"Approximate timing"},
       {"n":5,"title":"Step title","desc":"Step description","date":"Approximate timing"},
       {"n":6,"title":"Step title","desc":"Step description","date":"Approximate timing"}
     ]`
  )
  return safeParseJSON(text, [])
}

// ── 3. Election quiz ─────────────────────────────────────
export async function getElectionQuiz(countryName) {
  const text = await callGemini(
    `Create 3 multiple choice quiz questions about elections in ${countryName}.
     Return ONLY a valid JSON array, no markdown, no explanation, no extra text:
     [
       {"q":"Question text?","opts":["Option A","Option B","Option C","Option D"],"ans":0},
       {"q":"Question text?","opts":["Option A","Option B","Option C","Option D"],"ans":1},
       {"q":"Question text?","opts":["Option A","Option B","Option C","Option D"],"ans":2}
     ]
     ans is the 0-indexed position of the correct answer.`
  )
  return safeParseJSON(text, [])
}

// ── 4. Election facts ────────────────────────────────────
export async function getElectionFacts(countryName) {
  const text = await callGemini(
    `Give 3 surprising or interesting facts about elections or democracy in ${countryName}.
     Return ONLY a valid JSON array of strings, no markdown, no explanation:
     ["Fact one here","Fact two here","Fact three here"]`
  )
  return safeParseJSON(text, [])
}
