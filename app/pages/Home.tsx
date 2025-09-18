import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';

const Home = ({ navigation }: { navigation: any }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Home1');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/snack-icon.png')} style={styles.logo} />
      <Text style={styles.title}>Alerta de Quedas</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3EBCE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginTop: 20,
  },
});

export default Home;