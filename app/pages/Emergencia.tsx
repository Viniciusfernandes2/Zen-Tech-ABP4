import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Emergencia = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergência</Text>
      <Text style={styles.subtitle}>Contato imediato com alguém próximo</Text>
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Ligar para contato</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>SMS</Text>
      </TouchableOpacity>

         <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Ativar alarme no App</Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        Ao ativar alarme no app a outra pessoa será notificada imediatamente e terá sua localização
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3EBCE5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
  },
});

export default Emergencia;