/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import js from '@eslint/js';
import headers from 'eslint-plugin-headers';
import jsdoc from 'eslint-plugin-jsdoc';
import nodePlugin from 'eslint-plugin-n';
import vitestPlugin from 'eslint-plugin-vitest';
import globals from 'globals';

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
        rules: {
            'no-undef': 'error',
            'no-caller': 'error',
            eqeqeq: 'error',
            'no-extra-bind': 'warn',
            'no-empty': 'off',
            'no-process-exit': 'warn',
            'no-use-before-define': 'off',
            'no-unused-vars': ['error', { args: 'none' }],
            'no-unsafe-negation': 'error',
            'no-loop-func': 'warn',
            'no-console': 'off',
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-property-description': 'off',
            'jsdoc/require-returns-description': 'off',
            'jsdoc/tag-lines': [
                'warn',
                'never',
                {
                    startLines: 1,
                },
            ],
            'n/no-unsupported-features/node-builtins': ['error'],
            'n/no-deprecated-api': 'error',
            'n/no-missing-import': 'error',
            'n/no-missing-require': 'off',
            'n/no-unpublished-bin': 'error',
            'n/no-unpublished-import': 'error',
            'n/no-unpublished-require': 'off',
            'n/process-exit-as-throw': 'error',
            'headers/header-format': [
                'error',
                {
                    source: 'string',
                    content: `This file is part of the Symfony Webpack Encore package.

(c) Fabien Potencier <fabien@symfony.com>

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.`,
                    blockPrefix: '\n',
                },
            ],
        },
        settings: {
            jsdoc: {
                mode: 'typescript',
            },
        },
    },
    {
        files: ['test/**/*'],
        languageOptions: {
            ecmaVersion: 2025,
            globals: {
                // For Puppeteer when calling "page.evaluate()"
                document: 'readonly',
            },
        },
        rules: {
            'n/no-unsupported-features/node-builtins': [
                'error',
                {
                    ignores: ['import.meta.dirname', 'import.meta.filename'],
                },
            ],
            'vitest/expect-expect': 'off',
            'vitest/valid-expect': 'off',
            'vitest/valid-describe-callback': 'off',
        },
    },
];
