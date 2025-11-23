// src/screens/Historico.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getHistoricoQuedas } from '../services/historicoService';

const { width } = Dimensions.get('window');
const ASSISTIDO_KEY = '@bioalert_assistido_selecionado';

type Evento = {
  id: string;
  tipo: string;
  mensagem?: string;
  criado_em: string;
};

const Historico = ({ navigation }: { navigation: any }) => {
  const [assistido, setAssistido] = useState<any>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [quantidadeQuedas, setQuantidadeQuedas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const carregarAssistidoSelecionado = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(ASSISTIDO_KEY);
      if (!raw) {
        setAssistido(null);
        return null;
      }
      const parsed = JSON.parse(raw);
      setAssistido(parsed);
      return parsed;
    } catch (e) {
      console.warn('[Historico] Erro ao carregar assistido', e);
      return null;
    }
  }, []);

  const carregarHistorico = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const selected = await carregarAssistidoSelecionado();
      if (!selected?.id) {
        setEventos([]);
        setQuantidadeQuedas(0);
        return;
      }

      const resp = await getHistoricoQuedas(selected.id);
      const listaRaw = resp?.items ?? resp ?? [];

      const lista: Evento[] = (Array.isArray(listaRaw) ? listaRaw : []).map((x: any) => {
        const criado =
          x.criado_em ??
          x.created_at ??
          x.source_timestamp ??
          x.createdAt ??
          x.created_at_iso ??
          null;

        const tipo = x.tipo ?? x.event_type ?? x.eventType ?? 'evento';

        let mensagem = x.mensagem ?? x.message ?? null;
        if (!mensagem && x.raw_payload) {
          try {
            if (typeof x.raw_payload === 'string') {
              mensagem = x.raw_payload;
            } else if (x.raw_payload.mensagem) {
              mensagem = x.raw_payload.mensagem;
            } else if (x.raw_payload.message) {
              mensagem = x.raw_payload.message;
            } else {
              mensagem = JSON.stringify(x.raw_payload);
            }
          } catch {
            mensagem = null;
          }
        }

        return {
          id: String(x.id ?? x.event_id ?? Math.random().toString(36).slice(2)),
          tipo,
          mensagem,
          criado_em: criado ?? new Date().toISOString(),
        };
      });

      // Calcular quantidade de quedas
      const quedas = lista.filter(evento => 
        evento.tipo.toLowerCase().includes('queda') || 
        evento.mensagem?.toLowerCase().includes('queda')
      ).length;
      setQuantidadeQuedas(quedas);

      // Ordenar por data decrescente
      const ordenado = lista.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
      setEventos(ordenado);
    } catch (e: any) {
      console.warn('[Historico] erro ao carregar', e);
      if (!silent) {
        Alert.alert('Erro', 'Falha ao carregar histórico.');
      }
      setEventos([]);
      setQuantidadeQuedas(0);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [carregarAssistidoSelecionado]);

  useEffect(() => {
    // Carregar dados inicialmente
    carregarHistorico();

    // Configurar atualização automática a cada 1 segundo
    intervalRef.current = setInterval(() => {
      carregarHistorico(true); // true = modo silencioso (sem loading)
    }, 2000);

    // Limpar intervalo quando o componente for desmontado
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [carregarHistorico]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarHistorico();
    setRefreshing(false);
  };

  const getEventoIcon = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('queda')) return '⚠️';
    if (tipoLower.includes('bateria')) return '🔋';
    if (tipoLower.includes('ping') || tipoLower.includes('sinal')) return '📡';
    if (tipoLower.includes('conexão') || tipoLower.includes('conexao')) return '📶';
    return '📌';
  };

  const getEventoColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('queda')) return '#FF6B6B';
    if (tipoLower.includes('bateria')) return '#FFA726';
    if (tipoLower.includes('ping') || tipoLower.includes('sinal')) return '#4FC3F7';
    if (tipoLower.includes('conexão') || tipoLower.includes('conexao')) return '#66BB6A';
    return '#9C27B0';
  };

  const getEventoTitulo = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('queda')) return 'Queda Detectada';
    if (tipoLower.includes('bateria')) return 'Status da Bateria';
    if (tipoLower.includes('ping') || tipoLower.includes('sinal')) return 'Sinal da Pulseira';
    if (tipoLower.includes('conexão') || tipoLower.includes('conexao')) return 'Status de Conexão';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Eventos recentes do idoso selecionado</Text>
      </View>

      {/* Card de Estatísticas */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{quantidadeQuedas}</Text>
          <Text style={styles.statLabel}>Quedas Detectadas</Text>
        </View>
        <View style={styles.statSeparator} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{eventos.length}</Text>
          <Text style={styles.statLabel}>Total de Eventos</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3E8CE5" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3E8CE5']}
              tintColor="#3E8CE5"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {eventos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
              <Text style={styles.emptySubtext}>
                Os eventos aparecerão aqui quando ocorrerem
              </Text>
            </View>
          ) : (
            eventos.map((evento) => (
              <View 
                key={evento.id} 
                style={[
                  styles.card,
                  { borderLeftColor: getEventoColor(evento.tipo) }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardIcon}>
                      {getEventoIcon(evento.tipo)}
                    </Text>
                    <Text style={styles.cardTipo}>
                      {getEventoTitulo(evento.tipo)}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getEventoColor(evento.tipo) }
                    ]}
                  />
                </View>

                {evento.mensagem && (
                  <Text style={styles.cardMensagem}>{evento.mensagem}</Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardData}>
                    {new Date(evento.criado_em).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1e293b', 
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: { 
    color: '#64748b', 
    fontSize: 16,
    lineHeight: 22,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 24,
    marginTop: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statSeparator: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3E8CE5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  center: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 40,
  },
  loadingText: { 
    color: '#64748b', 
    marginTop: 16,
    fontSize: 16,
  },
  scroll: { 
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyBox: { 
    alignItems: 'center', 
    marginTop: 60,
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: { 
    color: '#475569', 
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3E8CE5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cardTipo: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cardMensagem: { 
    marginBottom: 16, 
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  cardData: { 
    fontSize: 13, 
    color: '#94a3b8', 
    fontWeight: '500',
  },
});

export default Historico;