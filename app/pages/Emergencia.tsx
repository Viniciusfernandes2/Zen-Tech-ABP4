// pages/Emergencia.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const Emergencia = ({ navigation }: { navigation: any }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Emergência</Text>
        <Text style={styles.subtitle}>Contato imediato com alguém próximo</Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ligar para contato</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Enviar SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ativar alarme no App</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('ConfiguracaoEmergencia')}
        >
          <Text style={styles.configButtonText}>Configurar Contatos de Emergência</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📞 <Text style={styles.infoBold}>Ligar para contato:</Text> Discagem direta para o contato principal
          </Text>
          <Text style={styles.infoText}>
            💬 <Text style={styles.infoBold}>SMS:</Text> Envia mensagem automática para todos os contatos cadastrados
          </Text>
          <Text style={styles.infoText}>
            🚨 <Text style={styles.infoBold}>Ativar alarme:</Text> Notifica contatos e compartilha localização em tempo real
          </Text>
        </View>

        <Text style={styles.footerText}>
          Ao ativar o alarme no app, seus contatos de emergência serão notificados imediatamente 
          e receberão sua localização atual.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#3EBCE5',
    padding: 18,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  configButton: {
    backgroundColor: '#5fcf80',
    padding: 18,
    borderRadius: 10,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  configButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3EBCE5',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default Emergencia;