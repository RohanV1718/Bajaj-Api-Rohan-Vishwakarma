import { isValidTransition } from './transitionValidator.js';

const runTests = () => {
  const tests = [
    { current: 'open', next: 'in_progress', expected: true },
    { current: 'in_progress', next: 'resolved', expected: true },
    { current: 'resolved', next: 'closed', expected: true },
    { current: 'resolved', next: 'in_progress', expected: true },
    { current: 'closed', next: 'resolved', expected: true },
    { current: 'in_progress', next: 'open', expected: true },
    { current: 'open', next: 'resolved', expected: false },
    { current: 'open', next: 'closed', expected: false },
    { current: 'closed', next: 'in_progress', expected: false },
  ];

  console.log('Running transition tests...');
  let failed = 0;
  tests.forEach((t) => {
    const res = isValidTransition(t.current, t.next);
    if (res.valid !== t.expected) {
      console.error(`❌ Fail: ${t.current} -> ${t.next}. Expected ${t.expected}, got ${res.valid}. Msg: ${res.message}`);
      failed++;
    } else {
      console.log(`✅ Pass: ${t.current} -> ${t.next} (Expected: ${t.expected})`);
    }
  });

  if (failed > 0) {
    console.error(`${failed} tests failed!`);
    process.exit(1);
  } else {
    console.log('All transition validator tests passed successfully!');
  }
};

runTests();
