module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/**/__tests__/**',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'app.ts',
        'src/config/',
        'src/utils/',
        'server.ts',
        'config/database.ts',
        'src/tests/__mocks__',
        'src/services/',
        'src/middlewares/',
        'src/tests/',
    ]
};