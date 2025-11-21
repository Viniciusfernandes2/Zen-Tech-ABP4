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

import * as deviceService from '../services/deviceService';
import { meusAssistidosApi } from '../services/assistidosService';
import api from '../api/axios';

const ASSISTIDO_KEY = '@bioalert_assistido_selecionado';

const Pulseira = ({ navigation }: { navigation: any }) => {
  const [assistido, setAssistido] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pareando, setPareando] = useState<boolean>(false);
  const [codigo, setCodigo] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

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

  const buscarDispositivoPorAssistido = useCallback(async (assistidoId?: string) => {
    if (!assistidoId) return null;

    const s: any = deviceService;

    const candidates: any[] = [
      s.getDeviceByAssistido,
      s.buscarDispositivoPorAssistido,
      s.getByAssistido,
      s.buscarPorIdoso,
      s.buscarPorAssistido
    ];

    for (const fn of candidates) {
      if (typeof fn === 'function') {
        try {
          const resp = await fn(assistidoId);
          const device = resp?.dispositivo ?? resp?.device ?? resp?.data ?? resp;
          return Array.isArray(device) ? device[0] || null : device;
        } catch { }
      }
    }

    try {
      const resp = await meusAssistidosApi();
      const lista = resp?.assistidos ?? resp ?? [];
      if (Array.isArray(lista)) {
        const a = lista.find((x: any) => String(x.id) === String(assistidoId));
        if (a) {
          const d = a.dispositivo ?? a.dispositivos ?? a.device ?? null;
          return Array.isArray(d) ? d[0] : d;
        }
      }
    } catch { }

    try {
      const resp = await api.get(`/devices/assistido/${assistidoId}`);
      return resp?.data ?? null;
    } catch { }

    return null;
  }, []);

  const carregarTudo = useCallback(async () => {
    setLoading(true);
    try {
      const sel = await carregarAssistidoSelecionado();
      if (!sel) {
        setDeviceInfo(null);
        return;
      }
      const device = await buscarDispositivoPorAssistido(sel.id);
      setDeviceInfo(device);
    } catch {
      setDeviceInfo(null);
    } finally {
      setLoading(false);
    }
  }, [carregarAssistidoSelecionado, buscarDispositivoPorAssistido]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarTudo();
    setRefreshing(false);
  };

  const handleParear = async () => {
    if (!assistido?.id) {
      return Alert.alert("Atenção", "Selecione um idoso.");
    }
    if (!codigo.trim()) {
      return Alert.alert("Atenção", "Informe o código da pulseira.");
    }

    setPareando(true);
    try {
      const isCurto = codigo.trim().length <= 8;
      const payload: any = {
        assistido_id: assistido.id
      };
      if (isCurto) payload.codigo_curto = codigo.trim().toUpperCase();
      else payload.codigo_esp = codigo.trim();

      if (payload.codigo_curto) {
        await api.post('/device/pair', payload);
      } else {
        await deviceService.parearDevice(payload.codigo_esp, payload.assistido_id);
      }

      Alert.alert('Sucesso', 'Pulseira pareada com sucesso!');
      setCodigo('');
      await carregarTudo();

    } catch (err: any) {
      const msg = err?.response?.data?.erro || err?.message || "Falha ao parear.";
      Alert.alert("Erro", msg);
    } finally {
      setPareando(false);
    }
  };

  const handleTestPing = async () => {
    if (!deviceInfo?.id && !deviceInfo?.codigo_esp) {
      return Alert.alert("Erro", "Nenhuma pulseira vinculada.");
    }

    try {
      await api.post('/device/heartbeat', {
        codigo_esp: deviceInfo.codigo_esp
      });

      Alert.alert("OK", "Ping enviado à pulseira.");
      carregarTudo();

    } catch (err) {
      Alert.alert("Erro", "Falha ao enviar ping.");
    }
  };

  const handleUnpair = async () => {
    if (!deviceInfo) return Alert.alert("Erro", "Nenhuma pulseira vinculada.");

    Alert.alert("Desvincular", "Deseja remover a pulseira deste idoso?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desvincular",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post('/device/unpair', {
              codigo_esp: deviceInfo.codigo_esp,
              codigo_curto: deviceInfo.codigo_curto
            });

            Alert.alert("OK", "Pulseira desvinculada.");
            carregarTudo();

          } catch {
            Alert.alert("Erro", "Não foi possível desvincular.");
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciar Pulseira</Text>
          <Text style={styles.subtitle}>Vincule e gerencie a pulseira do idoso</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Carregando informações...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {!deviceInfo ? (
              <>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, styles.statusUnpaired]} />
                  <Text style={styles.statusText}>Pulseira não vinculada</Text>
                </View>

                <View style={styles.formContainer}>
                  <Text style={styles.label}>Código da Pulseira</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o código da pulseira..."
                    placeholderTextColor="#9CA3AF"
                    value={codigo}
                    onChangeText={setCodigo}
                    autoCapitalize="characters"
                  />
                  
                  <TouchableOpacity
                    style={[styles.primaryButton, pareando && styles.buttonDisabled]}
                    onPress={handleParear}
                    disabled={pareando}
                  >
                    {pareando ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Vincular Pulseira</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, styles.statusPaired]} />
                  <Text style={styles.statusText}>Pulseira Vinculada</Text>
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
                    <Text style={styles.infoLabel}>Último Contato</Text>
                    <Text style={styles.infoValue}>{deviceInfo.last_seen || "Não disponível"}</Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleTestPing}
                  >
                    <Text style={styles.actionButtonText}>Testar Comunicação</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={handleUnpair}
                  >
                    <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                      Desvincular
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
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: { 
    color: '#64748B', 
    fontSize: 16,
    textAlign: 'center'
  },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 24, 
    borderRadius: 16, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  statusPaired: {
    backgroundColor: '#10B981'
  },
  statusUnpaired: {
    backgroundColor: '#EF4444'
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B'
  },
  formContainer: {
    marginTop: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 20
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  deviceInfo: {
    marginBottom: 8
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600'
  },
  actionsContainer: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA'
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  dangerButtonText: {
    color: '#DC2626'
  }
});

export default Pulseira;