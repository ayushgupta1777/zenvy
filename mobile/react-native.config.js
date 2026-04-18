module.exports = {
  assets: ["./node_modules/react-native-vector-icons/Fonts"],
  project: {
    android: {
      packageName: "com.newrajfancystore.app",
    },
  },
  dependencies: {
    'react-native-code-push': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-code-push/android/app',
        },
      },
    },
  },
};
