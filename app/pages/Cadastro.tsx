import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const Cadastro = ({ navigation }: { navigation: any }) => {
  const [nome, setNome] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <Text style={styles.subtitle}>Insira seu nome para iniciarmos</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        value={nome}
        onChangeText={setNome}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={styles.buttonText}>Confirmar</Text>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3EBCE5',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Cadastro;