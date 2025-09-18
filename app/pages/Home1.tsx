import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const LoadingScreen = ({ navigation }: { navigation: any }) => {
  useEffect(() => {
    // Show loading indicator for 4 seconds before navigating to Principal
    const timer = setTimeout(() => {
      navigation.navigate('Principal');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5fcf80" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;