let currentUtterance = null;

export function speakText(text) {
  window.speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = 'en-US';
  currentUtterance.rate = 0.95;
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha')
  );
  if (preferred) currentUtterance.voice = preferred;
  window.speechSynthesis.speak(currentUtterance);
  return currentUtterance;
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking() {
  return window.speechSynthesis.speaking;
}
