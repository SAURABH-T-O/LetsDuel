import cron from 'node-cron';
import { Problem } from '../models/Problem.js';
import { importCodeforcesProblems } from './problemService.js';

const CODEFORCES_PROBLEMS_URL = 'https://codeforces.com/api/problemset.problems';

export const syncCodeforcesProblemset = async () => {
  console.log('[ProblemSync] Fetching latest problemset from Codeforces...');

  try {
    const response = await fetch(CODEFORCES_PROBLEMS_URL, {
      headers: {
        accept: 'application/json',
        'user-agent': 'LetsDuelBackend/1.0',
      },
    });

    if (!response.ok) {
      console.warn(`[ProblemSync] Codeforces returned HTTP ${response.status}`);
      return { success: false, reason: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (data.status !== 'OK' || !Array.isArray(data.result?.problems)) {
      console.warn('[ProblemSync] Unexpected Codeforces API response:', data.comment || data.status);
      return { success: false, reason: data.comment || 'Invalid response' };
    }

    const result = await importCodeforcesProblems(data.result.problems);
    console.log(`[ProblemSync] Successfully synced ${result.imported} problems into MongoDB.`);
    return { success: true, imported: result.imported };
  } catch (error) {
    console.error('[ProblemSync] Failed to sync Codeforces problems:', error.message);
    return { success: false, error: error.message };
  }
};

export const initProblemSyncJob = () => {
  // If problem collection is empty on startup, run background seed
  Problem.countDocuments()
    .then((count) => {
      if (count === 0) {
        console.log('[ProblemSync] Problem collection is empty. Starting initial seed in background...');
        syncCodeforcesProblemset();
      }
    })
    .catch((err) => {
      console.warn('[ProblemSync] Could not check problem count on boot:', err.message);
    });

  // Daily at 03:00 AM server local time
  const task = cron.schedule('0 3 * * *', () => {
    console.log('[ProblemSync] Running scheduled daily Codeforces problem sync...');
    syncCodeforcesProblemset();
  });

  console.log('[ProblemSync] Scheduled daily Codeforces sync job at 03:00 AM.');
  return task;
};
