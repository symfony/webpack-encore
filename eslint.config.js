/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import globals from 'globals';
import js from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import jsdoc from 'eslint-plugin-jsdoc';
import headers from 'eslint-plugin-headers';
import vitestPlugin from 'eslint-plugin-vitest';

export default [
    js.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    jsdoc.configs['flat/recommended'],
    vitestPlugin.configs.recommended,
    {
        plugins: {
            headers,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        'rules': {
            'quotes': ['error', 'single'],
            'no-undef': 'error',
            'no-extra-semi': 'error',
            'semi': 'error',
            'no-template-curly-in-string': 'error',
            'no-caller': 'error',
            'eqeqeq': 'error',
            'brace-style': 'error',
            'eol-last': 'error',
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            'no-extra-bind': 'warn',
            'no-empty': 'off',
            'no-multiple-empty-lines': 'error',
            'no-multi-spaces': 'error',
            'no-process-exit': 'warn',
            'space-in-parens': 'error',
            'no-trailing-spaces': 'error',
            'no-use-before-define': 'off',
            'no-unused-vars': ['error', { 'args': 'none' }],
            'key-spacing': 'error',
            'space-infix-ops': 'error',
            'no-unsafe-negation': 'error',
            'no-loop-func': 'warn',
            'space-before-function-paren': ['error', 'never'],
            'space-before-blocks': 'error',
            'object-curly-spacing': ['error', 'always'],
            'keyword-spacing': ['error', {
                'after': true
            }],
            'no-console': 'off',
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-property-description': 'off',
            'jsdoc/require-returns-description': 'off',
            'jsdoc/tag-lines': ['warn', 'never', {
                'startLines': 1
            }],
            'n/no-unsupported-features/node-builtins': ['error'],
            'n/no-deprecated-api': 'error',
            'n/no-missing-import': 'error',
            'n/no-missing-require': 'off',
            'n/no-unpublished-bin': 'error',
            'n/no-unpublished-import': 'error',
            'n/no-unpublished-require': 'off',
            'n/process-exit-as-throw': 'error',
            'headers/header-format': ['error', {
                source: 'string',
                content: `This file is part of the Symfony Webpack Encore package.

(c) Fabien Potencier <fabien@symfony.com>

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.`,
                blockPrefix: '\n',
            }]
        },
        'settings': {
            'jsdoc': {
                'mode': 'typescript'
            }
        },
    },
    {
        'files': ['test/**/*'],
        languageOptions: {
            globals: {
                // For Puppeteer when calling "page.evaluate()"
                document: 'readonly',
            },
        },
    }
];
