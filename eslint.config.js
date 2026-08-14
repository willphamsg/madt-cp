module.exports = [
    {
        ignores: ['shared/graphql/generated/graphql.ts', '.nx', '.angular', 'dist'],
    },
    ...require('./eslint.base'),
];
