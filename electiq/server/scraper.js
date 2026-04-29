import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const ELECTIONS_FILE = path.join(DATA_DIR, 'elections.json')
const FALLBACK_FILE = path.join(DATA_DIR, 'elections-fallback.json')

let cachedElections = []
let lastScraped = null
let isScrapingInProgress = false

// ✅ Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  console.log('Created data/ directory')
}

const getDaysUntil = (dateStr) => {
  const electionDate = new Date(dateStr)
  const today = new Date()
  const diffTime = electionDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export async function scrapeUpcomingElections() {
  if (isScrapingInProgress) {
    console.log('Scraping already in progress, skipping...')
    return
  }

  isScrapingInProgress = true
  console.log('Starting election scraping...')

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',   // ✅ Critical for Render
        '--disable-gpu',              // ✅ Render has no GPU
        '--no-zygote',                // ✅ Reduces memory usage
        '--single-process'            // ✅ Required on some Render instances
      ]
    })

    const results = await Promise.all([
      scrapeIDEA(browser),
      scrapeIFES(browser),
    ])

    const allElections = results.flat()

    if (allElections.length === 0) {
      console.warn('⚠️ Scrapers returned 0 elections — loading fallback instead')
      loadFallback()
      return
    }

    const uniqueMap = new Map()
    allElections.forEach(e => {
      const key = `${e.country}-${e.electionType}-${e.date}`.toLowerCase()
      if (!uniqueMap.has(key)) uniqueMap.set(key, e)
    })

    const merged = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(e => {
        const daysUntil = getDaysUntil(e.date)
        return { ...e, daysUntil, isActive: daysUntil <= 60 && daysUntil >= -1 }
      })

    cachedElections = merged
    lastScraped = new Date()

    // ✅ Save as both elections.json AND update fallback
    const payload = JSON.stringify({ elections: cachedElections, lastScraped }, null, 2)
    fs.writeFileSync(ELECTIONS_FILE, payload)
    fs.writeFileSync(FALLBACK_FILE, payload) // Keep fallback fresh
    console.log(`✅ Scraping complete. Found ${merged.length} unique elections.`)

  } catch (error) {
    console.error('❌ Scraping failed:', error.message)
    loadFallback()
  } finally {
    if (browser) await browser.close()
    isScrapingInProgress = false
  }
}

async function scrapeIDEA(browser) {
  console.log('Scraping IDEA...')
  try {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(60000)
    await page.goto('https://www.idea.int/democracytracker/elections-list', {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    const elections = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'))
      return rows.map(row => {
        const cols = row.querySelectorAll('td')
        if (cols.length < 5) return null
        const country = cols[0].innerText.trim()
        const type = cols[2].innerText.trim()
        const dateStr = cols[4].innerText.trim()
        if (!country || !dateStr || dateStr === '-') return null
        return { country, electionType: type, date: dateStr }
      }).filter(Boolean)
    })

    await page.close()
    console.log(`IDEA found ${elections.length} raw rows.`)

    return elections.map(e => {
      try {
        const d = new Date(e.date)
        if (isNaN(d.getTime())) return null
        return { ...e, date: d.toISOString().split('T')[0] }
      } catch { return null }
    }).filter(Boolean)

  } catch (e) {
    console.error('IDEA Scraper Error:', e.message)
    return []
  }
}

async function scrapeIFES(browser) {
  console.log('Scraping IFES...')
  try {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(60000)
    await page.goto('https://www.electionguide.org/elections/type/upcoming/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    const elections = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'))
      return rows.map(row => {
        const cols = row.querySelectorAll('td')
        if (cols.length < 6) return null
        const country = cols[3].innerText.trim()
        const type = cols[4].innerText.trim()
        const dateStr = cols[5].innerText.trim().split(' ')[0]
        if (!country || !dateStr || dateStr === '-') return null
        return { country, electionType: type, date: dateStr }
      }).filter(Boolean)
    })

    await page.close()
    console.log(`IFES found ${elections.length} raw rows.`)

    return elections.map(e => {
      try {
        const d = new Date(e.date)
        if (isNaN(d.getTime())) return null
        return { ...e, date: d.toISOString().split('T')[0] }
      } catch { return null }
    }).filter(Boolean)

  } catch (e) {
    console.error('IFES Scraper Error:', e.message)
    return []
  }
}

function loadFallback() {
  // ✅ Try elections.json first, then fallback
  const files = [ELECTIONS_FILE, FALLBACK_FILE]
  for (const file of files) {
    if (fs.existsSync(file)) {
      try {
        const raw = fs.readFileSync(file, 'utf-8')
        const parsed = JSON.parse(raw)
        const elections = parsed.elections || parsed
        if (Array.isArray(elections) && elections.length > 0) {
          cachedElections = elections
          lastScraped = parsed.lastScraped ? new Date(parsed.lastScraped) : new Date()
          console.log(`✅ Loaded ${elections.length} elections from ${path.basename(file)}`)
          return
        }
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e.message)
      }
    }
  }
  // ✅ Last resort: hardcoded seed data so API never returns empty
  console.warn('⚠️ No data files found, using hardcoded seed data')
  cachedElections = getSeedElections()
  lastScraped = new Date()
}

export function getCachedElections() {
  if (cachedElections.length === 0) {
    console.log('Cache empty, loading fallback...')
    loadFallback()
  }
  return { elections: cachedElections, lastScraped }
}

// ✅ Seed data — ensures API always returns something even on first cold start
function getSeedElections() {
  return [
    { country: 'Germany', electionType: 'Parliamentary', date: '2025-09-28', daysUntil: 90, isActive: false },
    { country: 'Canada', electionType: 'Federal', date: '2025-10-20', daysUntil: 112, isActive: false },
    { country: 'India', electionType: 'State', date: '2025-11-15', daysUntil: 138, isActive: false },
  ]
}