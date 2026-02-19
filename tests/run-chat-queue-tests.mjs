import assert from 'node:assert/strict';
import { ChatRunQueue } from '../dist-test/chatQueue.js';

async function testSerialSameKey() {
  const q = new ChatRunQueue();
  const events = [];

  const p1 = q.enqueue('c1', async () => {
    events.push('start1');
    await new Promise((r) => setTimeout(r, 30));
    events.push('end1');
    return 1;
  });

  const p2 = q.enqueue('c1', async () => {
    events.push('start2');
    await new Promise((r) => setTimeout(r, 5));
    events.push('end2');
    return 2;
  });

  const [r1, r2] = await Promise.all([p1, p2]);
  assert.equal(r1, 1);
  assert.equal(r2, 2);
  assert.deepEqual(events, ['start1', 'end1', 'start2', 'end2']);
}

async function testParallelDifferentKeys() {
  const q = new ChatRunQueue();
  let running = 0;
  let maxRunning = 0;

  const run = async (key) => q.enqueue(key, async () => {
    running++;
    if (running > maxRunning) maxRunning = running;
    await new Promise((r) => setTimeout(r, 20));
    running--;
  });

  await Promise.all([run('a'), run('b')]);
  assert.ok(maxRunning >= 2);
}

async function main() {
  await testSerialSameKey();
  console.log('PASS serial same key');
  await testParallelDifferentKeys();
  console.log('PASS parallel different keys');
  console.log('All chat queue tests passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
