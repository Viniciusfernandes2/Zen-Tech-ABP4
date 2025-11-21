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
  const [pairCode, setPairCode] = useState<string>('');
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

      if (pairCode.trim()) payload.pair_code = pairCode.trim();

      if (payload.codigo_curto) {
        await api.post('/device/pair', payload);
      } else {
        await deviceService.parearDevice(payload.codigo_esp, payload.assistido_id, payload.pair_code);
      }

      Alert.alert('Sucesso', 'Pulseira pareada com sucesso!');
      setCodigo('');
      setPairCode('');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Pulseira</Text>
        <Text style={styles.subtitle}>Gerencie a pulseira vinculada ao idoso.</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3E8CE5" />
          </View>
        ) : (
          <View style={styles.card}>
            {!deviceInfo ? (
              <>
                <Text style={styles.noDeviceText}>
                  Nenhuma pulseira vinculada a este idoso.
                </Text>

                <Text style={styles.labelSmall}>Código da pulseira:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: A9F3K1 ou código completo"
                  value={codigo}
                  onChangeText={setCodigo}
                  autoCapitalize="characters"
                />

                <Text style={styles.labelSmall}>Pair code (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pair code"
                  value={pairCode}
                  onChangeText={setPairCode}
                  secureTextEntry
                />

                <TouchableOpacity
                  style={[styles.btn, pareando && styles.btnDisabled]}
                  onPress={handleParear}
                  disabled={pareando}
                >
                  <Text style={styles.btnText}>
                    {pareando ? "Pareando..." : "Parear Pulseira"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.labelSmall}>Código ESP:</Text>
                  <Text style={styles.valueSmall}>{deviceInfo.codigo_esp}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.labelSmall}>Código Curto:</Text>
                  <Text style={styles.valueSmall}>{deviceInfo.codigo_curto}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.labelSmall}>Último contato:</Text>
                  <Text style={styles.valueSmall}>{deviceInfo.last_seen || "—"}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={handleTestPing}>
                    <Text style={styles.actionBtnText}>Testar comunicação</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#d32f2f" }]}
                    onPress={handleUnpair}
                  >
                    <Text style={[styles.actionBtnText, { color: "#fff" }]}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 20, paddingBottom: 80 },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 6 },
  subtitle: { color: '#666', marginBottom: 14 },
  center: { alignItems: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  noDeviceText: { color: '#666', marginBottom: 12 },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },

  btn: {
    backgroundColor: '#3E8CE5',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#9E9E9E'
  },
  btnText: {
    color: '#fff',
    fontWeight: '700'
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },

  labelSmall: {
    fontSize: 13,
    color: '#666'
  },
  valueSmall: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600'
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  actionBtn: {
    backgroundColor: '#3E8CE5',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
    alignItems: 'center'
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700'
  }
});

export default Pulseira;
