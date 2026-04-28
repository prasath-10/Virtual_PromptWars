export async function speakText(text) {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${import.meta.env.VITE_GOOGLE_TTS_API_KEY}`,
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
    throw new Error('TTS API request failed');
  }
  const data = await response.json();
  const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
  audio.play();
  return audio;
}
