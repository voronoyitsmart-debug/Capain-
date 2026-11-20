'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Google Gemini calls, made by the server (the key never reaches a browser).
// Same prompts and model order as core/Code.gs (callGemini_, translateTexts_); only the HTTP call is Node's fetch.
const { USER } = require('./errors');

/** Try each model until one answers; remembers the one that worked via setModel. */
async function callGemini(key, body, models, prefer, setModel) {
  const order = prefer ? [prefer].concat(models.filter(m => m !== prefer)) : models.slice();
  let lastErr = '';
  for (const model of order) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
    let resp, txt;
    try {
      resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: body,
        signal: AbortSignal.timeout(120000) });
      txt = await resp.text();
    } catch (e) { lastErr = String(e && e.message || e); continue; }
    if (resp.status === 200) {
      let data = null; try { data = JSON.parse(txt); } catch (e) {}
      const c = data && data.candidates && data.candidates[0];
      const out = c && c.content && c.content.parts ? c.content.parts.map(p => p.text || '').join('') : '';
      if (!out) { lastErr = 'empty reply'; continue; }
      if (setModel) setModel(model);
      return { text: out, model: model };
    }
    // 404 = this model is not available for the key, try the next one; 400/403 = a key problem, stop.
    if (resp.status === 400 || resp.status === 403) {
      let msg = 'request rejected'; try { msg = JSON.parse(txt).error.message || msg; } catch (e) {}
      throw USER('ai_rejected', 'Gemini rejected the request (' + resp.status + '): ' + String(msg).slice(0, 160));
    }
    lastErr = resp.status + ' ' + String(txt).slice(0, 120);
  }
  throw USER('ai_unreachable', 'Could not reach Gemini (' + lastErr + '). Check the API key and try again.');
}

function stripFence(t) {
  t = String(t || '').trim();
  const m = /```(?:json)?\s*([\s\S]*?)```/.exec(t);
  return (m ? m[1] : t).trim();
}

/** items: [{ text, to: 'uk'|'en' }] → array of strings in the same order. */
async function translateTexts(ai, items) {
  if (!items.length) return [];
  const prompt = 'Translate each item of the JSON array below for a school test. "to" is the target language: "uk" = Ukrainian, "en" = English. ' +
    'Keep everything between $…$ (LaTeX formulas) exactly as it is, keep numbers, units, chemical formulas and gaps written as ___ unchanged. ' +
    'Use the usual school terminology of that language. Return ONLY a JSON array of strings, the translations in the same order, nothing else.\n' +
    JSON.stringify(items.map(x => ({ to: x.to, text: x.text })));
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, response_mime_type: 'application/json', maxOutputTokens: 16384 } });
  const result = await ai.call(body);
  let arr = null; try { arr = JSON.parse(stripFence(result.text)); } catch (e) {}
  if (!Array.isArray(arr) || arr.length !== items.length) throw USER('ai_unreadable', 'The AI reply could not be read. Please try again.');
  return arr.map(x => String(x == null ? '' : x));
}

/** Short explanations of the right answers (for the students' review after a test). items: [{ q, answer, lang }] → strings. */
async function explainAnswers(ai, items) {
  if (!items.length) return [];
  const prompt = 'Explain answers for a school test review. For each item of the JSON array write 1–2 short sentences in the language "lang" ' +
    '("uk" = Ukrainian, "en" = English) for a student: why the given right answer is right (the rule, the calculation step or the fact). ' +
    'Keep LaTeX between $…$ as it is. Do not repeat the question. Return ONLY a JSON array of strings in the same order.\n' +
    JSON.stringify(items.map(x => ({ lang: x.lang, q: x.q, answer: x.answer })));
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, response_mime_type: 'application/json', maxOutputTokens: 16384 } });
  const result = await ai.call(body);
  let arr = null; try { arr = JSON.parse(stripFence(result.text)); } catch (e) {}
  if (!Array.isArray(arr) || arr.length !== items.length) throw USER('ai_unreadable', 'The AI reply could not be read. Please try again.');
  return arr.map(x => String(x == null ? '' : x));
}

module.exports = { callGemini, translateTexts, explainAnswers, stripFence };
