import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRoleAwareReply, buildSystemPrompt } from './chatbotHelpers.js';

test('buildRoleAwareReply answers an actual application question', () => {
  const reply = buildRoleAwareReply('How do I apply for a job?', 'seeker', 'Jane');
  assert.match(reply, /apply/i);
  assert.match(reply, /application|profile|job/i);
});

test('buildRoleAwareReply is recruiter-specific for posting jobs', () => {
  const reply = buildRoleAwareReply('I want to post a new job as a recruiter', 'recruiter', 'Alex');
  assert.match(reply, /post|publish|job/i);
  assert.match(reply, /recruiter|candidate|posting/i);
});

test('buildSystemPrompt includes the role and asks for actual question focus', () => {
  const prompt = buildSystemPrompt('Sara', 'visitor');
  assert.match(prompt, /visitor/i);
  assert.match(prompt, /exact question/i);
  assert.match(prompt, /do not guess hidden intent/i);
});
