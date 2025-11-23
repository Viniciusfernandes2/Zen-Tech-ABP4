// src/screens/Historico.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getHistoricoQuedas } from '../services/historicoService';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const carregarHistorico = useCallback(async () => {
    setLoading(true);
    try {
      const selected = await carregarAssistidoSelecionado();
      if (!selected?.id) {
        setEventos([]);
        return;
      }

      const resp = await getHistoricoQuedas(selected.id);
      // resp pode ter { items } ou a lista direto
      const listaRaw = resp?.items ?? resp ?? [];

      // mapear para o formato que a UI espera
      const lista: Evento[] = (Array.isArray(listaRaw) ? listaRaw : []).map((x: any) => {
        // determinar data
        const criado =
          x.criado_em ??
          x.created_at ??
          x.source_timestamp ??
          x.createdAt ??
          x.created_at_iso ??
          null;

        // determinar tipo
        const tipo = x.tipo ?? x.event_type ?? x.eventType ?? 'evento';

        // mensagem - prioriza raw_payload.msg, raw_payload.message, x.mensagem, x.message
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

      // ordenar por data decrescente
      const ordenado = lista.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

      setEventos(ordenado);
    } catch (e: any) {
      console.warn('[Historico] erro ao carregar', e);
      Alert.alert('Erro', 'Falha ao carregar histórico.');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [carregarAssistidoSelecionado]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarHistorico();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Histórico</Text>
      <Text style={styles.subtitle}>Eventos recentes do idoso selecionado.</Text>

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
            />
          }
        >
          {eventos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
            </View>
          ) : (
            eventos.map((evento) => (
              <View key={evento.id} style={styles.card}>
                <Text style={styles.cardTipo}>
                  {evento.tipo === 'queda'
                    ? '⚠️ Queda detectada'
                    : evento.tipo === 'bateria'
                    ? '🔋 Atualização de bateria'
                    : evento.tipo === 'ping'
                    ? '📡 Sinal da pulseira'
                    : `📌 ${evento.tipo}`}
                </Text>

                {evento.mensagem && (
                  <Text style={styles.cardMensagem}>{evento.mensagem}</Text>
                )}

                <Text style={styles.cardData}>
                  {new Date(evento.criado_em).toLocaleString('pt-BR')}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: 16 },
  center: { alignItems: 'center', marginTop: 40 },
  loadingText: { color: '#666', marginTop: 10 },
  scroll: { paddingBottom: 100 },
  emptyBox: { alignItems: 'center', marginTop: 30 },
  emptyText: { color: '#777', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 14,
  },
  cardTipo: { fontSize: 18, fontWeight: '700', color: '#333' },
  cardMensagem: { marginTop: 6, color: '#555' },
  cardData: { marginTop: 10, fontSize: 12, color: '#777', fontStyle: 'italic' },
});

export default Historico;
