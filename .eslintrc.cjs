/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
  },

  parser: '@typescript-eslint/parser',

  plugins: [
    '@typescript-eslint',
    'import',
    'unused-imports',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],

  rules: {
    /* ======================
     * 基础约束（像 Checkstyle）
     * ====================== */

    'no-var': 'error',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always'],

    'curly': ['error', 'all'],

    /* ======================
     * Import 规范（非常重要）
     * ====================== */

    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    'import/no-unresolved': 'off', // Cocos 路径特殊，必须关

    /* ======================
     * 未使用代码（比 Checkstyle 严）
     * ====================== */

    'unused-imports/no-unused-imports': 'error',

    '@typescript-eslint/no-unused-vars': 'off',

    'unused-imports/no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],

    /* ======================
     * 命名规范（重点）
     * ====================== */

    '@typescript-eslint/naming-convention': [
      'error',

      // 类 / 接口 / 类型
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },

      // 枚举成员
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },

      // 常量
      {
        selector: 'variable',
        modifiers: ['const'],
        format: ['camelCase', 'UPPER_CASE'],
      },

      // 普通变量 / 函数
      {
        selector: 'variableLike',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },

      // private 成员
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
    ],

    /* ======================
     * Cocos Creator 特化
     * ====================== */

    'no-console': 'off',

    '@typescript-eslint/no-explicit-any': 'warn',

    '@typescript-eslint/explicit-function-return-type': 'off',

    '@typescript-eslint/no-empty-function': 'off',

    '@typescript-eslint/no-invalid-this': 'off',
  },

  ignorePatterns: [
    'library/',
    'temp/',
    'build/',
    'dist/',
    '*.d.ts',
  ],
};