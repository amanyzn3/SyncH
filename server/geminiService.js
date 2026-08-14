import { loadData } from './db.js';

export async function generateGeminiContent(prompt, systemContext = '', requestKey = null) {
  const db = loadData();
  const apiKey = requestKey || db.settings?.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return null;
  }

  const cleanKey = apiKey.trim();

  const modelsToTry = [
    'gemini-flash-latest',
    'gemini-2.5-flash-latest',
    'gemini-3.7-flash',
    'gemini-pro-latest',
    'gemini-1.5-flash'
  ];

  const fullPrompt = systemContext 
    ? `You are Synhub AI Assistant. Use the live system context below to answer user queries accurately.\n\nSystem Context:\n${systemContext}\n\nUser Question:\n${prompt}`
    : prompt;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: fullPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          })
        });

        if (response.status === 503 || response.status === 429) {
          // Google 503 high demand spike: wait 300ms and retry
          console.warn(`[GeminiService] Model ${model} HTTP ${response.status} spike (attempt ${attempt + 1}), retrying...`);
          await new Promise(r => setTimeout(r, 300));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`[GeminiService] Model ${model} HTTP ${response.status}:`, errorText);
          break; // Try next model
        }

        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText && replyText.trim()) {
          console.log(`[GeminiService] Success! Generated response using model: ${model}`);
          return replyText.trim();
        }
      } catch (err) {
        console.error(`[GeminiService] Exception calling ${model}:`, err.message);
        break;
      }
    }
  }

  console.warn('[GeminiService] All Gemini models or retries exhausted. Using local engine fallback.');
  return null;
}
