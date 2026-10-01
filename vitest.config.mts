import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const LIVE = '**/live.test.ts';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // CI: failures annotated on the PR's lines, and a JUnit file for the run's test report
    // (.github/workflows/ci.yml). Vitest's own job summary is off; the report replaces it.
    reporters: process.env.CI
      ? ['default', ['github-actions', { jobSummary: { enabled: false } }], 'junit']
      : ['default'],
    outputFile: { junit: 'reports/unit.xml' },
    projects: [
      // `npm run test`: everything that runs offline, in CI and locally.
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.test.{ts,tsx}'],
          exclude: ['node_modules', '.next', LIVE],
        },
      },
      // `npm run test:live`: the dev Supabase project (needs .env.local; network-bound, ~15 s).
      { extends: true, test: { name: 'live', include: [LIVE] } },
    ],
  },
});
