import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesProfileSearch } from '../shared/profile-search.js';

test('an empty or whitespace-only query matches every profile', () => {
  assert.equal(matchesProfileSearch({ city: '上海', traits: [] }, ''), true);
  assert.equal(matchesProfileSearch({ city: '上海', traits: [] }, '   '), true);
});

test('English translations of Chinese industry/education terms are searchable', () => {
  assert.equal(matchesProfileSearch({ industry: '互联网', traits: [] }, 'internet'), true);
  assert.equal(matchesProfileSearch({ education: '硕士', traits: [] }, 'masters'), true);
  assert.equal(matchesProfileSearch({ property: '有房', traits: [] }, 'own house'), true);
});

test('multi-token queries require every token to match (AND, not OR)', () => {
  const profile = { city: '上海', industry: '金融', traits: [] };
  assert.equal(matchesProfileSearch(profile, 'shanghai finance'), true);
  assert.equal(matchesProfileSearch(profile, 'shanghai healthcare'), false);
});

test('numeric fields like age and height are searchable as plain text', () => {
  assert.equal(matchesProfileSearch({ age: 28, height: 175, traits: [] }, '175'), true);
  assert.equal(matchesProfileSearch({ age: 28, height: 175, traits: [] }, '28'), true);
});

test('field-name words are not searchable unless a profile actually contains them', () => {
  const profile = { city: '上海', industry: '金融', education: '硕士', traits: [] };
  for (const term of ['city', 'hukou', 'school', 'industry', 'education', 'income', 'height']) {
    assert.equal(matchesProfileSearch(profile, term), false, `expected "${term}" not to match every profile`);
  }
});
