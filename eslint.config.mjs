import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Repository boundary (brief §4): UI code reaches data only through lib/container.ts.
  {
    files: ['app/**', 'components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/lib/repositories/*',
                '**/lib/repositories/**',
                '**/repositories/fixtures/**',
              ],
              message:
                'UI must not import repository implementations or fixtures. Use getRepositories() from @/lib/container.',
            },
          ],
        },
      ],
    },
  },
  // Allow intentionally unused destructured names prefixed with `_`.
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Design reference files (generated mockup runtime), not app code.
    'docs/**',
  ]),
]);

export default eslintConfig;
