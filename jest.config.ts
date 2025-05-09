module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',  // Carpeta donde se guardarán los reports
    collectCoverageFrom: [          // Archivos a incluir en el análisis
        'src/**/*.ts',
        '!src/**/*.d.ts',             // Excluye archivos de declaración TypeScript
        '!src/**/index.ts',           // Excluye archivos índice
        '!src/**/__tests__/**',       // Excluye los tests mismos
    ],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'app.ts',
        'config/database.ts',
        'src/tests/__mocks__',
        'src/services/',
    ]
};