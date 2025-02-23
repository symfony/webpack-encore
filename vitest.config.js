// vitest.config.js
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.test.js'],
        // Re-define "forceRerunTriggers" to exclude `package.json` and `test_tmp/**/package.json` to prevent infinite watch loop
        forceRerunTriggers: ['./vitest.config.js'],
    },
});
