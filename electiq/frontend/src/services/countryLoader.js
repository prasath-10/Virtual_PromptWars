import { saveCountry, loadCountry } from './db';
import { API } from './api';
import {
  getElectionExplainer,
  getElectionSteps,
  getElectionQuiz,
  getElectionFacts
} from './gemini';

const memoryCache = {};

export async function loadCountryData(countryName) {
  if (memoryCache[countryName]) return memoryCache[countryName];

  const cached = await loadCountry(countryName);
  if (cached) {
    memoryCache[countryName] = cached;
    return cached;
  }

  const [backendRes, explainer, steps, quiz, facts] = await Promise.all([
    fetch(API.country(encodeURIComponent(countryName))),
    getElectionExplainer(countryName),
    getElectionSteps(countryName),
    getElectionQuiz(countryName),
    getElectionFacts(countryName)
  ]);

  if (!backendRes.ok) {
    throw new Error(`Failed to fetch data for ${countryName}`);
  }

  const backendData = await backendRes.json();

  const data = {
    ...backendData,
    explainer,
    steps,
    quiz,
    facts
  };

  memoryCache[countryName] = data;
  await saveCountry(countryName, data);
  return data;
}
