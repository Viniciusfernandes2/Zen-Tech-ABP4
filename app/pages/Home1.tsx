import { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingScreen = ({ navigation }: { navigation: any }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Principal');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#3E8CE5" />
        <Text style={styles.loadingText}>Carregando...</Text>
        <Text style={styles.subText}>Preparando seu ambiente</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 25,
    color: '#333',
    fontWeight: '600',
  },
  subText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingScreen;