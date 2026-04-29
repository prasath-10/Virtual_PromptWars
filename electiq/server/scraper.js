import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ELECTIONS_FILE = path.join(__dirname, 'data', 'elections.json')
const FALLBACK_FILE = path.join(__dirname, 'data', 'elections-fallback.json')

let cachedElections = []
let lastScraped = null

// Helper to calculate days until
const getDaysUntil = (dateStr) => {
  const electionDate = new Date(dateStr)
  const today = new Date()
  const diffTime = electionDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export async function scrapeUpcomingElections() {
  console.log('Starting election scraping...')
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const results = await Promise.all([
      scrapeIDEA(browser),
      scrapeIFES(browser),
      scrapeWikipedia(browser)
    ])

    const allElections = results.flat()
    
    // Merge and deduplicate by country + type + date
    const uniqueMap = new Map()
    allElections.forEach(e => {
      const key = `${e.country}-${e.electionType}-${e.date}`.toLowerCase()
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, e)
      }
    })

    const merged = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(e => {
        const daysUntil = getDaysUntil(e.date)
        return {
          ...e,
          daysUntil,
          isActive: daysUntil <= 60 && daysUntil >= -1
        }
      })

    cachedElections = merged
    lastScraped = new Date()

    // Write to elections.json
    fs.writeFileSync(ELECTIONS_FILE, JSON.stringify({ elections: cachedElections, lastScraped }, null, 2))
    console.log(`Scraping complete. Found ${merged.length} unique elections.`)

  } catch (error) {
    console.error('Scraping failed, loading fallback:', error)
    loadFallback()
  } finally {
    await browser.close()
  }
}

async function scrapeIDEA(browser) {
  console.log('Scraping IDEA...')
  try {
    const page = await browser.newPage()
    await page.goto('https://www.idea.int/democracytracker/elections-list', { waitUntil: 'networkidle2', timeout: 60000 })
    
    const elections = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'))
      return rows.map(row => {
        const cols = row.querySelectorAll('td')
        if (cols.length < 5) return null
        
        // Headers: Country(0), Region(1), Type(2), Note(3), Date(4), Status(5)
        const country = cols[0].innerText.trim()
        const type = cols[2].innerText.trim()
        const dateStr = cols[4].innerText.trim()
        
        if (!country || !dateStr || dateStr === '-') return null
        
        return { country, electionType: type, date: dateStr }
      }).filter(e => e !== null)
    })
    
    console.log(`IDEA found ${elections.length} raw rows.`)
    return elections.map(e => {
        try {
            const d = new Date(e.date)
            if (isNaN(d.getTime())) return null
            return { ...e, date: d.toISOString().split('T')[0] }
        } catch { return null }
    }).filter(e => e !== null)
  } catch (e) {
    console.error('IDEA Scraper Error:', e.message)
    return []
  }
}

async function scrapeIFES(browser) {
  console.log('Scraping IFES...')
  try {
    const page = await browser.newPage()
    await page.goto('https://www.electionguide.org/elections/type/upcoming/', { waitUntil: 'networkidle2', timeout: 60000 })
    
    const elections = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'))
      return rows.map(row => {
        const cols = row.querySelectorAll('td')
        // Headers: [0,1,2] empty, [3] Country, [4] Election for, [5] Start Date
        if (cols.length < 6) return null
        
        const country = cols[3].innerText.trim()
        const type = cols[4].innerText.trim()
        const dateStr = cols[5].innerText.trim().split(' ')[0] // Remove '(d)' etc
        
        if (!country || !dateStr || dateStr === '-') return null
        
        return { country, electionType: type, date: dateStr }
      }).filter(e => e !== null)
    })
    
    console.log(`IFES found ${elections.length} raw rows.`)
    return elections.map(e => {
        try {
            const d = new Date(e.date)
            if (isNaN(d.getTime())) return null
            return { ...e, date: d.toISOString().split('T')[0] }
        } catch { return null }
    }).filter(e => e !== null)
  } catch (e) {
    console.error('IFES Scraper Error:', e.message)
    return []
  }
}

async function scrapeWikipedia(browser) {
  // Wikipedia structure is too inconsistent across years/lists for a simple table parser.
  // Skipping for now to focus on IDEA and IFES which are working.
  return []
}

function loadFallback() {
  if (fs.existsSync(FALLBACK_FILE)) {
    const raw = fs.readFileSync(FALLBACK_FILE)
    cachedElections = JSON.parse(raw)
    lastScraped = new Date()
  }
}

export function getCachedElections() {
  if (cachedElections.length === 0) {
    loadFallback()
  }
  return { elections: cachedElections, lastScraped }
}
