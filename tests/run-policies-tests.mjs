import assert from 'node:assert/strict';
import {
  isBotMentioned,
  isApiRequestAuthorized,
  sanitizeErrorForUser,
  parseLoggerLevel,
} from '../dist-test/policies.js';

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run('isBotMentioned returns true only when bot open_id is present', () => {
  const mentions = [
    { id: { open_id: 'ou_user_1' } },
    { id: { open_id: 'ou_bot_123' } },
  ];
  assert.equal(isBotMentioned(mentions, 'ou_bot_123'), true);
  assert.equal(isBotMentioned(mentions, 'ou_other_bot'), false);
  assert.equal(isBotMentioned(mentions, undefined), false);
  assert.equal(isBotMentioned([], 'ou_bot_123'), false);
});

run('isApiRequestAuthorized requires bearer token when configured', () => {
  assert.equal(isApiRequestAuthorized('Bearer secret', 'secret', '10.0.0.2'), true);
  assert.equal(isApiRequestAuthorized(undefined, 'secret', '127.0.0.1'), false);
  assert.equal(isApiRequestAuthorized('Bearer wrong', 'secret', '127.0.0.1'), false);
});

run('isApiRequestAuthorized allows loopback when token is unset', () => {
  assert.equal(isApiRequestAuthorized(undefined, undefined, '127.0.0.1'), true);
  assert.equal(isApiRequestAuthorized(undefined, undefined, '::1'), true);
  assert.equal(isApiRequestAuthorized(undefined, undefined, '10.0.0.2'), false);
});

run('sanitizeErrorForUser hides internal details', () => {
  const msg = sanitizeErrorForUser(new Error('secret path D:/repo/.env'));
  assert.match(msg, /处理失败/);
  assert.doesNotMatch(msg, /secret path/);
});

run('parseLoggerLevel supports env values with fallback', () => {
  assert.equal(parseLoggerLevel('debug'), 'debug');
  assert.equal(parseLoggerLevel('ERROR'), 'error');
  assert.equal(parseLoggerLevel('unknown'), 'info');
  assert.equal(parseLoggerLevel(undefined), 'info');
});

console.log('All policy tests passed');
