import type { ConfigFunction } from '@babel/core';

const config: ConfigFunction = (api) => {
  api.cache(true);
  return {
    presets: [
      [
        'module:metro-react-native-babel-preset',
        {
          runtime: 'automatic',
        }
      ],
      ['@babel/preset-typescript', {
        isTSX: true,
        allExtensions: true,
        allowNamespaces: true,
      }]
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './src',
            '@screens': './src/screens',
            '@components': './src/components',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
            '@assets': './src/assets',
            '@config': './src/config',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      test: {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ]
      },
      production: {
        plugins: ['transform-remove-console']
      }
    }
  };
};

export default config;