const globals = require('globals');

module.exports = [
    {
        ignores: ['shared/graphql/generated/graphql.ts', '.nx', '.angular', 'dist'],
    },
    ...require('./eslint.base'),
    {
        // Executes in the browser (autoclicker/dev-server driver script), not Node.
        files: ['test/**/*.js'],
        languageOptions: {
            globals: { ...globals.browser },
        },
    },
];
