module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  skipLegacyWorkersInjection: true,
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: '../frontend/ios/build/Build/Products/Debug-iphonesimulator/YourAppName.app',
      build: 'cd ../frontend && xcodebuild -workspace ios/YourAppName.xcworkspace -scheme YourAppName -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: '../frontend/android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd ../frontend && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [
        8081
      ]
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 12'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3a_API_30_x86'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};