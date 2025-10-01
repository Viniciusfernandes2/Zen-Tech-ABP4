import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Localizacao = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Localização</Text>
      <Text style={styles.text}>Localização em tempo real a partir da queda</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Ativar localização agora</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3E8CE5',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Localizacao;