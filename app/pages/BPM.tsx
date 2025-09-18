import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const BPM = () => {
  const bpm = 80; // Valor fixo de 80 BPM

  const getStatus = () => {
    if (bpm < 60) return 'Abaixo do normal';
    if (bpm > 100) return 'Acima do normal';
    return 'Normal';
  };

  const getStatusColor = () => {
    if (bpm < 60) return '#ff6b35';
    if (bpm > 100) return '#ff6b35';
    return '#5fcf80';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>BPM</Text>
        <Text style={styles.subtitle}>Batimentos por minuto contados pela pulseira</Text>
        
        <View style={styles.bpmContainer}>
          <Text style={styles.bpmValue}>{bpm}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>
        
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatus()}</Text>
        </View>
        
        <Text style={styles.info}>
          Seus batimentos cardíacos estão sendo monitorados constantemente.
          Em caso de alterações significativas, você será notificado.
        </Text>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  bpmContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  bpmValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  bpmLabel: {
    fontSize: 24,
    color: '#666',
  },
  statusContainer: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
});

export default BPM;