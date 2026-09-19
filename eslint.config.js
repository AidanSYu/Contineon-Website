import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },

  /* shadcn/ui primitives are generated, library-style components that export
     their variant helpers (buttonVariants, etc.) alongside the component and
     occasionally use non-pure helpers. The Fast-Refresh and purity rules are
     dev-only HMR hints, not correctness issues, so silence them here rather
     than diverge from upstream shadcn. */
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/lib/scroll-fx.tsx', 'src/components/Seo.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/purity': 'off',
    },
  },

  /* Vite/Vitest config files use the supported `/// <reference>` triple-slash
     directive; test helpers intentionally use `any` for fixture plumbing. */
  {
    files: ['*.config.ts', 'supabase/tests/**/*.ts', 'src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
