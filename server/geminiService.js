import { loadData } from './db.js';

export async function generateGeminiContent(prompt, systemContext = '', requestKey = null, attachment = null) {
  const db = loadData();
  const apiKey = requestKey || db.settings?.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return null;
  }

  const cleanKey = apiKey.trim();

  // Valid, high-performance Gemini models in priority order
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash'
  ];

  const fullPrompt = systemContext 
    ? `You are Synhub AI Assistant. Use the live system context below to answer user queries accurately, concisely, and with high analytical precision.\n\nSystem Context:\n${systemContext}\n\nUser Query/Instruction:\n${prompt || 'Please analyze the attached image or document and solve/explain it completely.'}`
    : prompt || 'Please analyze the attached image or document and solve/explain it completely.';

  const parts = [];

  // If attachment (photo or document base64 data) is present, add inlineData part for Gemini Vision
  if (attachment && attachment.base64Data && attachment.mimeType) {
    parts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.base64Data
      }
    });
  }

  parts.push({ text: fullPrompt });

  for (const model of modelsToTry) {
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
              parts: parts
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[GeminiService] Model ${model} HTTP ${response.status}:`, errorText);
        continue; // Try next valid model
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText && replyText.trim()) {
        console.log(`[GeminiService] Fast response generated using model: ${model}`);
        return replyText.trim();
      }
    } catch (err) {
      console.error(`[GeminiService] Exception calling ${model}:`, err.message);
    }
  }

  console.warn('[GeminiService] Gemini API call skipped or unfulfilled. Using local engine fallback.');
  return null;
}
