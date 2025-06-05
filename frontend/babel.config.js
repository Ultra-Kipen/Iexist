module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    test: {
      plugins: [
        ['transform-define', {
          '__DEV__': true,
          'process.env.__DEV__': true
        }]
      ]
    }
  },
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens', 
          '@contexts': './src/contexts',
          '@services': './src/services'
        }
      }
    ]
  ]
};