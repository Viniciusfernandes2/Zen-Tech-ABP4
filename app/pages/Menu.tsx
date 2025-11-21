// src/pages/Menu.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import api from '../api/axios'; // usa o axios do projeto (interceptor, token etc.). :contentReference[oaicite:4]{index=4}
import { meusAssistidosApi } from '../services/assistidosService'; // buscar assistidos vinculados. :contentReference[oaicite:5]{index=5}

type Assistido = {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
  telefone_1?: string;
  telefone_2?: string;
  codigo_compartilhamento?: string;
};

const ASSISTIDO_KEY = '@bioalert_assistido_selecionado';

const Menu = ({ navigation, route }: { navigation: any; route: any }) => {
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAssistido, setCurrentAssistido] = useState<Assistido | null>(null);
  const [sendingPush, setSendingPush] = useState(false);

  // Carrega assistidos do backend
  const carregarAssistidos = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await meusAssistidosApi();
      // backend retorna { assistidos: [...] } ou apenas array dependendo; acomodar ambos
      const lista: Assistido[] = resp?.assistidos ?? resp ?? [];
      setAssistidos(lista);

      // se houver assistidos salvos localmente, mantemos seleção
      const saved = await AsyncStorage.getItem(ASSISTIDO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Assistido;
        // checar se ainda existe na lista, senão reset
        const exists = lista.find((a) => String(a.id) === String(parsed.id));
        if (exists) setCurrentAssistido(exists);
        else if (lista.length > 0) {
          setCurrentAssistido(lista[0]);
          await AsyncStorage.setItem(ASSISTIDO_KEY, JSON.stringify(lista[0]));
        } else {
          setCurrentAssistido(null);
          await AsyncStorage.removeItem(ASSISTIDO_KEY);
        }
      } else {
        if (lista.length > 0) {
          setCurrentAssistido(lista[0]);
          await AsyncStorage.setItem(ASSISTIDO_KEY, JSON.stringify(lista[0]));
        }
      }
    } catch (e: any) {
      console.error('[Menu] carregarAssistidos error', e);
      Alert.alert('Erro', 'Falha ao carregar assistidos. Verifique sua conexão.');
      setAssistidos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Selecionar assistido por toque
  const selecionarAssistido = async (assistido: Assistido) => {
    setCurrentAssistido(assistido);
    await AsyncStorage.setItem(ASSISTIDO_KEY, JSON.stringify(assistido));
    // feedback leve
    Alert.alert('Assistido selecionado', assistido.nome_completo || 'Assistido');
  };

  // Registra (ou re-registra) Expo Push Token no backend
  const registerForPushNotificationsAsync = async () => {
    try {
      setSendingPush(true);

      // checar se já temos token salvo localmente (evita reenvios desnecessários)
      const savedToken = await AsyncStorage.getItem('@expo_push_token');
      if (savedToken) {
        // enviar ao backend apenas se não existir no usuário (caso precise forçar, remova o savedToken)
        try {
          await api.post('/usuarios/push-token', { expo_push_token: savedToken });
        } catch (err) {
          // se falhar, seguimos sem bloquear app
          console.warn('[Menu] push token envio falhou com token salvo', err);
        } finally {
          setSendingPush(false);
        }
        return;
      }

      // pedir permissão
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        // permissão negada
        console.log('[Menu] permissão de notificações negada');
        setSendingPush(false);
        return;
      }

      // obter token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoToken = tokenData.data;
      console.log('[Menu] expo push token obtido', expoToken);

      // enviar para o backend (rota: POST /usuarios/push-token)
      try {
        await api.post('/usuarios/push-token', { expo_push_token: expoToken });
        // salvar localmente para evitar reenvios
        await AsyncStorage.setItem('@expo_push_token', expoToken);
      } catch (err: any) {
        console.error('[Menu] falha ao enviar push token ao backend', err?.message ?? err);
      } finally {
        setSendingPush(false);
      }
    } catch (err) {
      console.error('[Menu] registerForPushNotificationsAsync error', err);
      setSendingPush(false);
    }
  };

  // on mount: carregar assistidos e registrar push token
  useEffect(() => {
    let mounted = true;
    (async () => {
      await carregarAssistidos();

      // somente se auth ok — axios interceptor redireciona 401 automaticamente
      try {
        // registra push token assim que o menu é aberto (first stable screen)
        await registerForPushNotificationsAsync();
      } catch (e) {
        console.warn('[Menu] push registration failed', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [carregarAssistidos]);

  // Navega para uma screen e passa assistido atual
  const goTo = (screenName: string) => {
    if (!currentAssistido) {
      Alert.alert('Atenção', 'Selecione um assistido antes de prosseguir.');
      return;
    }
    navigation.navigate(screenName, { assistido: currentAssistido });
  };

  // Logout simples (limpa token via axios helper - usamos AsyncStorage diretto aqui pra ser explícito)
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@bioalert_token'); // KEY === TOKEN_KEY no axios.ts
      await AsyncStorage.removeItem('@bioalert_user'); // USER_KEY
      await AsyncStorage.removeItem(ASSISTIDO_KEY);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.warn('[Menu] logout erro', e);
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <Text style={styles.subtitle}>
            Selecione o idoso que deseja monitorar e acesse funções.
          </Text>
        </View>

        {/* Assistidos list */}
        <View style={styles.assistidosContainer}>
          <Text style={styles.sectionTitle}>Assistidos</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#3E8CE5" />
          ) : assistidos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum assistido vinculado.</Text>
              <TouchableOpacity
                style={styles.adicionarButton}
                onPress={() => navigation.navigate('Cadastro')}
              >
                <Text style={styles.adicionarButtonText}>Adicionar Idoso</Text>
              </TouchableOpacity>
            </View>
          ) : (
            assistidos.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[
                  styles.assistidoCard,
                  currentAssistido?.id === a.id && styles.assistidoCardActive,
                ]}
                onPress={() => selecionarAssistido(a)}
              >
                <View>
                  <Text style={styles.assistidoNome}>{a.nome_completo}</Text>
                  <Text style={styles.assistidoInfo}>
                    {a.telefone_1 ?? '—'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Buttons principais do menu */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.menuButton} onPress={() => goTo('Pulseira')}>
            <Text style={styles.menuButtonText}>Pulseira</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => goTo('Historico')}>
            <Text style={styles.menuButtonText}>Histórico</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => goTo('Emergencia')}>
            <Text style={styles.menuButtonText}>Emergência</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('ConfiguracaoEmergencia')}>
            <Text style={styles.menuButtonText}>Configuração Emergência</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Perfil')}>
            <Text style={styles.menuButtonText}>Perfil</Text>
          </TouchableOpacity>

          {/* OBS: BPM e Localização removidos conforme combinado */}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>v1.0</Text>
          {sendingPush && <Text style={styles.sendingText}>Registrando notificações...</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 6 },
  assistidosContainer: { marginTop: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  assistidoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  assistidoCardActive: {
    borderColor: '#3E8CE5',
    shadowColor: '#3E8CE5',
    shadowOpacity: 0.12,
    elevation: 4,
  },
  assistidoNome: { fontSize: 16, fontWeight: '700', color: '#333' },
  assistidoInfo: { fontSize: 13, color: '#666', marginTop: 4 },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#666', marginBottom: 12 },
  adicionarButton: { backgroundColor: '#3E8CE5', padding: 12, borderRadius: 10 },
  adicionarButtonText: { color: '#fff', fontWeight: '700' },
  buttonsContainer: { marginTop: 10 },
  menuButton: {
    backgroundColor: '#3E8CE5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  menuButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footer: { marginTop: 20, alignItems: 'center' },
  logoutBtn: { padding: 10 },
  logoutText: { color: '#d32f2f', fontWeight: '700' },
  versionText: { color: '#999', marginTop: 6 },
  sendingText: { color: '#3E8CE5', marginTop: 8 },
});

export default Menu;
