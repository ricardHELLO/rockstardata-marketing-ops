import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Include all src files for the full coverage picture
      include: [
        'src/services/**',
        'src/validators/**',
        'src/lib/**',
        'src/middleware/**',
      ],
      exclude: ['src/index.ts', 'src/config.ts', 'node_modules'],
      // Thresholds apply to core business logic only (external API adapters
      // like pipedrive/slack/instantly require integration-level tests)
      thresholds: {
        'src/services/leads.service.ts': { statements: 80, branches: 80, functions: 80, lines: 80 },
        'src/services/blacklist.service.ts': { statements: 80, branches: 80, functions: 80, lines: 80 },
        'src/services/approvals.service.ts': { statements: 50, branches: 50, functions: 50, lines: 50 },
        'src/validators/*.ts': { statements: 80, branches: 80, functions: 80, lines: 80 },
      },
    },
  },
});
