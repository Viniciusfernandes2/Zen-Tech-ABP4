import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Principal = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerta de quedas</Text>
      <Text style={styles.subtitle}>
        Seja bem vindo! Este aplicativo funciona como um alerta em caso de quedas.
        Ligado à pulseira, ela acionará a luz caso a queda aconteça e será registrada no aplicativo.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3EBCE5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Principal;