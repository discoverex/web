import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 특정 파일(Node 스크립트)에 대한 규칙 완화 설정
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // require 허용
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // any 허용
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
