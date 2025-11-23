// src/screens/Pulseira.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../api/axios';
import { getDeviceByAssistido, unpairDeviceApi } from '../services/deviceService';

const ASSISTIDO_KEY = '@bioalert_assistido_selecionado';

const Pulseira = ({ navigation }: { navigation: any }) => {
  const [assistido, setAssistido] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pareando, setPareando] = useState<boolean>(false);
  const [codigo, setCodigo] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ============================================================
  // Carregar assistido selecionado
  // ============================================================
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
    } catch {
      setAssistido(null);
      return null;
    }
  }, []);

  // ============================================================
  // Buscar dispositivo associado ao assistido
  // ============================================================
  const carregarDispositivo = useCallback(async (assistidoId?: string) => {
    if (!assistidoId) {
      setDeviceInfo(null);
      return;
    }

    try {
      const dev = await getDeviceByAssistido(assistidoId);
      // getDeviceByAssistido retorna "dispositivo" ou null
      setDeviceInfo(dev || null);
    } catch (e) {
      // Se houver erro no backend, mantemos null (o front já mostra fallback)
      console.warn('[Pulseira] erro ao buscar dispositivo', e);
      setDeviceInfo(null);
    }
  }, []);

  // ============================================================
  // Carregar tudo
  // ============================================================
  const carregarTudo = useCallback(async () => {
    setLoading(true);
    try {
      const sel = await carregarAssistidoSelecionado();
      if (!sel) {
        setDeviceInfo(null);
        return;
      }
      await carregarDispositivo(sel.id);
    } catch {
      setDeviceInfo(null);
    } finally {
      setLoading(false);
    }
  }, [carregarAssistidoSelecionado, carregarDispositivo]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarTudo();
    setRefreshing(false);
  };

  // ============================================================
  // PAREAR DISPOSITIVO
  // ============================================================
  const handleParear = async () => {
    if (!assistido?.id) {
      return Alert.alert("Atenção", "Selecione um assistido.");
    }
    if (!codigo.trim()) {
      return Alert.alert("Atenção", "Informe o código da pulseira.");
    }

    setPareando(true);

    try {
      const clean = codigo.trim();

      const payload =
        clean.length <= 8
          ? { codigo_curto: clean.toUpperCase(), assistido_id: assistido.id }
          : { codigo_esp: clean, assistido_id: assistido.id };

      await api.post('/device/pair', payload);

      Alert.alert("Sucesso", "Pulseira vinculada ao assistido!");
      setCodigo('');

      await carregarTudo();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || "Falha ao parear.";
      Alert.alert("Erro", msg);
    } finally {
      setPareando(false);
    }
  };

  // ============================================================
  // DESVINCULAR DISPOSITIVO
  // ============================================================
  const handleUnpair = async () => {
    if (!deviceInfo) return Alert.alert("Erro", "Nenhum dispositivo vinculado.");

    Alert.alert("Desvincular", "Tem certeza que deseja remover a pulseira?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim, remover",
        style: "destructive",
        onPress: async () => {
          try {
            await unpairDeviceApi(deviceInfo.codigo_esp);
            Alert.alert("OK", "Pulseira removida.");
            await carregarTudo();
          } catch {
            Alert.alert("Erro", "Não foi possível desvincular.");
          }
        }
      }
    ]);
  };

  // ============================================================
  // UI
  // ============================================================
  function formatLastSeen(dt?: string | null) {
    if (!dt) return 'Nunca';
    const d = new Date(dt);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleString('pt-BR');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.title}>Gerenciar Pulseira</Text>
          <Text style={styles.subtitle}>Vincule e gerencie a pulseira do assistido</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <View style={styles.card}>

            {/* ================= NÃO VINCULADO ================== */}
            {!deviceInfo ? (
              <>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, styles.statusUnpaired]} />
                  <Text style={styles.statusText}>Pulseira não vinculada</Text>
                </View>

                <Text style={styles.label}>Código da Pulseira</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o código..."
                  placeholderTextColor="#9CA3AF"
                  value={codigo}
                  onChangeText={setCodigo}
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={[styles.primaryButton, pareando && styles.buttonDisabled]}
                  disabled={pareando}
                  onPress={handleParear}
                >
                  {pareando ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Vincular</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* ================= VINCULADA ================== */}
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, styles.statusPaired]} />
                  <Text style={styles.statusText}>Pulseira vinculada</Text>
                </View>

                <View style={styles.deviceInfo}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Código ESP</Text>
                    <Text style={styles.infoValue}>{deviceInfo.codigo_esp}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Código Curto</Text>
                    <Text style={styles.infoValue}>{deviceInfo.codigo_curto}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Último contato</Text>
                    <Text style={styles.infoValue}>{formatLastSeen(deviceInfo.last_seen)}</Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  {/* Botão TEST removido conforme solicitado */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={handleUnpair}
                  >
                    <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                      Remover
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  subtitle: { color: '#64748B', fontSize: 16 },

  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#64748B' },

  card: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    elevation: 5,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusPaired: { backgroundColor: '#10B981' },
  statusUnpaired: { backgroundColor: '#EF4444' },
  statusText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },

  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  deviceInfo: { marginBottom: 12 },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 14, color: '#64748B' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

  actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' },

  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  dangerButtonText: { color: '#DC2626' },
});

export default Pulseira;
