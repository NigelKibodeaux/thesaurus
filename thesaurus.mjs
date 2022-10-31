import fs from 'fs/promises';

const text = await fs.readFile(new URL('./en_thesaurus.jsonl', import.meta.url), 'utf-8');
const lines = text.split('\n');
const words = lines.filter(Boolean).map(line => JSON.parse(line));
const goodWords = words
    .filter(word => word.synonyms.length > 10)
    .filter(word => !word.word.includes(' '));
const output = goodWords.map(({word, synonyms}) => ({word, synonyms}));

await fs.writeFile(
    new URL('./word_list.js', import.meta.url),
    'const wordList = ' + JSON.stringify(output, null, 4)
);

console.log(`wrote ${output.length} words to word_list.js`);
