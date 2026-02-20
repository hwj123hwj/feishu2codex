import assert from 'node:assert/strict';
import { runWithTimeout } from '../dist-test/runTimeout.js';

async function testResolvesBeforeTimeout() {
  const result = await runWithTimeout(async () => {
    await new Promise((r) => setTimeout(r, 10));
    return 'ok';
  }, 100);
  assert.equal(result, 'ok');
}

async function testRejectsOnTimeout() {
  let aborted = false;
  await assert.rejects(
    () => runWithTimeout(async (signal) => {
      signal.addEventListener('abort', () => {
        aborted = true;
      });
      await new Promise((r) => setTimeout(r, 100));
      return 'late';
    }, 20),
    /timeout/i
  );
  assert.equal(aborted, true);
}

async function main() {
  await testResolvesBeforeTimeout();
  console.log('PASS resolves before timeout');
  await testRejectsOnTimeout();
  console.log('PASS rejects on timeout');
  console.log('All run-timeout tests passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
