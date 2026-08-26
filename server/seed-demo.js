import { closeStore } from './store.js';
import { seedDemoData } from './demo-data.js';

try {
  const result = await seedDemoData();
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeStore();
}
