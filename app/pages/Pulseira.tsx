import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Pulseira = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pulseira</Text>
      <Text>Status: Conectado</Text>
      <Text>Bateria: 80%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Pulseira;