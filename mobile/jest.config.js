module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|react-redux|@reduxjs/toolkit|immer|lucide-react-native|react-native-svg)/)',
  ],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest',
  },
  // lucide-react-native/react-native-svg ship ESM .mjs files; the RN preset's own
  // `transform` only matches .js/.ts/.tsx, so .mjs needs to be added explicitly
  // (asset transformer entry copied from the preset since this key replaces it wholesale).
  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': require.resolve(
      '@react-native/jest-preset/jest/assetFileTransformer.js',
    ),
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/testUtils/'],
  testTimeout: 20000,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/navigation/types.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
