import { getElectionExplainer, getElectionSteps, getElectionQuiz, getElectionFacts } from './gemini';
import { saveToCache, loadFromCache } from './cache';

const memoryCache = {};

export async function loadCountryData(countryName) {
  if (memoryCache[countryName]) return memoryCache[countryName];
  
  const cached = loadFromCache(countryName);
  if (cached) {
    memoryCache[countryName] = cached;
    return cached;
  }

  const [explainer, steps, quiz, facts] = await Promise.all([
    getElectionExplainer(countryName),
    getElectionSteps(countryName),
    getElectionQuiz(countryName),
    getElectionFacts(countryName),
  ]);
  
  const data = { explainer, steps, quiz, facts };
  memoryCache[countryName] = data;
  saveToCache(countryName, data);
  return data;
}
