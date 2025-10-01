import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BPM = () => {
  const bpm = 80;

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

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Referências:</Text>
          <Text style={styles.infoItem}>• Normal: 60-100 BPM</Text>
          <Text style={styles.infoItem}>• Abaixo do normal: menos de 60 BPM</Text>
          <Text style={styles.infoItem}>• Acima do normal: mais de 100 BPM</Text>
        </View>
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
    flexGrow: 1,
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
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#3E8CE5',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default BPM;