'use strict';
// © Платон Вороний. All rights reserved. See LICENSE.
// Loads the shared core (core/Code.gs) once per subject, together with that subject's Seed.gs,
// into its own sandbox. Everything about questions — the content model, the two languages,
// the public (answer-free) view of a test and the grading — comes from Code.gs unchanged,
// so this server grades exactly like the Google Apps Script versions.
// The Apps Script services Code.gs touches are replaced by small stubs; the storage functions
// of Code.gs (sheets) are never called — lib/api.js keeps the data in SQLite instead.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

// Order of subjects on the teacher's dashboard. Any other folder in subjects/ is added after these.
const ORDER = ['math', 'ukrainian', 'ukrlit', 'worldlit', 'english', 'physics', 'chemistry', 'biology', 'geography', 'history', 'worldhistory', 'informatics'];
const ICONS = { math: '📐', ukrainian: '📖', ukrlit: '🖋️', worldlit: '🎭', english: '🇬🇧', physics: '🧲', chemistry: '⚗️', biology: '🧬', geography: '🗺️', history: '📜', worldhistory: '🏛️', informatics: '💻' };

function makeSandbox(codeSrc, seedSrc, permSalt) {
  const props = { perm_salt: permSalt };
  const ctx = {
    console,
    Utilities: { getUuid: () => crypto.randomUUID(), sleep() {} },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: k => (Object.prototype.hasOwnProperty.call(props, k) ? props[k] : null),
      setProperty: (k, v) => { props[k] = String(v); }
    }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    SpreadsheetApp: { getActiveSpreadsheet() { throw new Error('SpreadsheetApp is not used on the local server'); } },
    ScriptApp: { getService: () => ({ getUrl: () => '' }) },
    UrlFetchApp: { fetch() { throw new Error('UrlFetchApp is not used on the local server'); } },
    HtmlService: {}
  };
  vm.createContext(ctx);
  // Apps Script joins all .gs files into one global scope; top-level const values are read out through __x.
  const src = codeSrc + '\n;\n' + seedSrc + '\n;\n' +
    'this.__x = { SUBJECT: typeof SUBJECT !== "undefined" ? SUBJECT : null,' +
    ' AI_INSTRUCTIONS: typeof AI_INSTRUCTIONS !== "undefined" ? AI_INSTRUCTIONS : "",' +
    ' GRACE_MS: GRACE_MS, MAX_CONTENT: MAX_CONTENT, LANGS: LANGS, GEMINI_MODELS: GEMINI_MODELS };';
  vm.runInContext(src, ctx, { filename: 'Code.gs+Seed.gs' });
  return ctx;
}

/** Copy a value out of (or into) a sandbox as plain JSON, so objects never carry another realm's prototypes. */
function plain(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }

function loadSubjects(rootDir, permSalt) {
  const codeSrc = fs.readFileSync(path.join(rootDir, 'core', 'Code.gs'), 'utf8');
  const dir = path.join(rootDir, 'subjects');
  const keys = fs.readdirSync(dir).filter(k => fs.existsSync(path.join(dir, k, 'Seed.gs')));
  keys.sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  const subjects = {};
  keys.forEach(k => {
    const ctx = makeSandbox(codeSrc, fs.readFileSync(path.join(dir, k, 'Seed.gs'), 'utf8'), permSalt);
    const info = plain(ctx.subject_());
    // the folder name is the key used in URLs and the database
    subjects[k] = { key: k, ctx: ctx, x: ctx.__x, info: info, icon: ICONS[k] || '📝' };
  });
  return subjects;
}

module.exports = { loadSubjects, plain };
