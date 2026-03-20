import fs from 'node:fs/promises';
import path from 'node:path';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'node:url';
import { frenchPhrases, frenchDialogues } from '../src/french-talking-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public', 'sqlite');

await fs.mkdir(publicDir, { recursive: true });

const SQL = await initSqlJs();
const db = new SQL.Database();

db.run(`
  CREATE TABLE phrases (
    id INTEGER PRIMARY KEY,
    english TEXT NOT NULL,
    french TEXT NOT NULL,
    phonetic TEXT NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE dialogue_lines (
    id INTEGER PRIMARY KEY,
    dialogue_id INTEGER NOT NULL,
    line_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    situation TEXT NOT NULL,
    speaker TEXT NOT NULL,
    french TEXT NOT NULL,
    english TEXT NOT NULL
  );
`);

const phraseStmt = db.prepare('INSERT INTO phrases (id, english, french, phonetic, category) VALUES (?, ?, ?, ?, ?)');
frenchPhrases.forEach((phrase, index) => {
  phraseStmt.run([index + 1, phrase.english, phrase.french, phrase.phonetic, phrase.category]);
});
phraseStmt.free();

const lineStmt = db.prepare(`
  INSERT INTO dialogue_lines (dialogue_id, line_index, title, situation, speaker, french, english)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

frenchDialogues.forEach((dialogue, dialogueIndex) => {
  dialogue.lines.forEach((line, lineIndex) => {
    lineStmt.run([
      dialogueIndex + 1,
      lineIndex + 1,
      dialogue.title,
      dialogue.situation,
      line.speaker,
      line.french,
      line.english,
    ]);
  });
});
lineStmt.free();

const data = db.export();
await fs.writeFile(path.join(publicDir, 'french-phrases.sqlite'), Buffer.from(data));

db.close();
