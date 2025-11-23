import { useEffect } from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = ({ navigation }: { navigation: any }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Home1');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/pulseira-icon-sos.png')} style={styles.logo} />
      <Text style={styles.title}>BioAlert</Text>
      <Text style={styles.subtitle}>Monitoramento Inteligente de Queda de Idoso</Text>
      <Text style={styles.version}>Versão 3.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#3E8CE5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  version: {
    position: 'absolute',
    bottom: 70,
    color: 'white',
    fontSize: 18,
    opacity: 0.9,
  },
});

export default Home;