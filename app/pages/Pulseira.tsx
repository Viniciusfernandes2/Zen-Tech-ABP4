import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Pulseira = () => {
  const [bateria, setBateria] = useState(85);
  const [conectado, setConectado] = useState(true);
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState('Hoje, 14:30');

  // Simulação de atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simula pequenas variações na bateria
      setBateria(prev => Math.max(10, prev - 0.1));
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  const getBateriaColor = () => {
    if (bateria > 50) return '#5fcf80';
    if (bateria > 20) return '#ffa726';
    return '#ff6b6b';
  };

  const getBateriaNivel = () => {
    if (bateria > 80) return 'Alta';
    if (bateria > 40) return 'Média';
    return 'Baixa';
  };

  const sincronizarPulseira = () => {
    setUltimaSincronizacao(new Date().toLocaleString('pt-BR', {
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    // Simula reconexão se estiver desconectado
    if (!conectado) {
      setConectado(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Status da Pulseira</Text>
        <Text style={styles.subtitle}>Monitoramento do dispositivo wearable</Text>

        {/* Card de Status Principal */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.deviceName}>BioAlert Wearable</Text>
            <View style={[
              styles.statusIndicator,
              conectado ? styles.conectado : styles.desconectado
            ]}>
              <Text style={styles.statusIndicatorText}>
                {conectado ? 'CONECTADO' : 'DESCONECTADO'}
              </Text>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Bateria</Text>
              <View style={styles.bateriaContainer}>
                <View style={styles.bateriaOuter}>
                  <View 
                    style={[
                      styles.bateriaInner,
                      { 
                        width: `${bateria}%`,
                        backgroundColor: getBateriaColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.bateriaText}>{Math.round(bateria)}%</Text>
              </View>
              <Text style={styles.bateriaNivel}>{getBateriaNivel()}</Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Última Sinc.</Text>
              <Text style={styles.statusValue}>{ultimaSincronizacao}</Text>
              <Text style={styles.statusHint}>Atualizado</Text>
            </View>
          </View>
        </View>

        {/* Informações do Dispositivo */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações do Dispositivo</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📱</Text>
              <Text style={styles.infoLabel}>Modelo</Text>
              <Text style={styles.infoValue}>BioAlert Pro</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📶</Text>
              <Text style={styles.infoLabel}>Sinal</Text>
              <Text style={styles.infoValue}>{conectado ? 'Forte' : 'Fraco'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🆔</Text>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={styles.infoValue}>BA-2024-001</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🔧</Text>
              <Text style={styles.infoLabel}>Firmware</Text>
              <Text style={styles.infoValue}>v2.1.4</Text>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={sincronizarPulseira}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionText}>Sincronizar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Localizar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⚡</Text>
              <Text style={styles.actionText}>Testar LED</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Diagnóstico</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dicas de Uso */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Dicas de Uso</Text>
          <Text style={styles.tipItem}>• Carregue a pulseira quando a bateria estiver abaixo de 20%</Text>
          <Text style={styles.tipItem}>• Mantenha o dispositivo sempre no pulso para melhor detecção</Text>
          <Text style={styles.tipItem}>• Verifique a conexão regularmente</Text>
          <Text style={styles.tipItem}>• Evite contato com água em excesso</Text>
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
  scrollContent: {
    flexGrow: 1,
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
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  conectado: {
    backgroundColor: '#5fcf80',
  },
  desconectado: {
    backgroundColor: '#ff6b6b',
  },
  statusIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bateriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bateriaOuter: {
    width: 60,
    height: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  bateriaInner: {
    height: '100%',
    borderRadius: 4,
  },
  bateriaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bateriaNivel: {
    fontSize: 12,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusHint: {
    fontSize: 12,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  tipItem: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default Pulseira;