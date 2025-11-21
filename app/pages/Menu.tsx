import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import api from '../api/axios';
import { meusAssistidosApi } from '../services/assistidosService';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAssistido, setCurrentAssistido] = useState<Assistido | null>(null);
  const [sendingPush, setSendingPush] = useState(false);

  // Carrega assistidos do backend
  const carregarAssistidos = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await meusAssistidosApi();
      const lista: Assistido[] = resp?.assistidos ?? resp ?? [];
      setAssistidos(lista);

      const saved = await AsyncStorage.getItem(ASSISTIDO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Assistido;
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

  // Menu lateral animation
  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    setIsMenuOpen(!isMenuOpen);
  };

  // Menu options
  const menuOptions = [
    { title: 'Perfil', screen: 'Perfil', icon: '👤' },
    { title: 'Pulseira', screen: 'Pulseira', icon: '⌚' },
    { title: 'Meu Histórico', screen: 'Historico', icon: '📊' },
    { title: 'Configuração Emergência', screen: 'ConfiguracaoEmergencia', icon: '⚙️' },
  ];

  const handleNavigation = (screen: string) => {
    toggleMenu();
    setTimeout(() => {
      if (!currentAssistido && screen !== 'Perfil') {
        Alert.alert('Atenção', 'Selecione um assistido antes de prosseguir.');
        return;
      }
      navigation.navigate(screen, { assistido: currentAssistido });
    }, 300);
  };

  // Selecionar assistido
  const selecionarAssistido = async (assistido: Assistido) => {
    setCurrentAssistido(assistido);
    await AsyncStorage.setItem(ASSISTIDO_KEY, JSON.stringify(assistido));
  };

  // Calcular idade
  const calcularIdade = (dataNascimento: string) => {
    const [ano, mes, dia] = dataNascimento.split('-');
    const nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    
    if (mesAtual < nascimento.getMonth() || 
        (mesAtual === nascimento.getMonth() && diaAtual < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  // Push notifications
  const registerForPushNotificationsAsync = async () => {
    try {
      setSendingPush(true);
      const savedToken = await AsyncStorage.getItem('@expo_push_token');
      if (savedToken) {
        try {
          await api.post('/usuarios/push-token', { expo_push_token: savedToken });
        } catch (err) {
          console.warn('[Menu] push token envio falhou com token salvo', err);
        } finally {
          setSendingPush(false);
        }
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Menu] permissão de notificações negada');
        setSendingPush(false);
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoToken = tokenData.data;
      console.log('[Menu] expo push token obtido', expoToken);

      try {
        await api.post('/usuarios/push-token', { expo_push_token: expoToken });
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

  // Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@bioalert_token');
      await AsyncStorage.removeItem('@bioalert_user');
      await AsyncStorage.removeItem(ASSISTIDO_KEY);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.warn('[Menu] logout erro', e);
      navigation.navigate('Login');
    }
  };

  // Load data on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      await carregarAssistidos();
      try {
        await registerForPushNotificationsAsync();
      } catch (e) {
        console.warn('[Menu] push registration failed', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [carregarAssistidos]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3E8CE5" barStyle="light-content" />
      
      {/* Header com botão hamburger */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hamburgerButton} onPress={toggleMenu}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BioAlert</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Conteúdo principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Bem-vindo ao BioAlert</Text>
        <Text style={styles.subtitle}>
          Monitoramento inteligente para sua segurança e bem-estar.
        </Text>
        
        {/* Seção do assistido selecionado */}
        {currentAssistido && (
          <View style={styles.idosoInfo}>
            <Text style={styles.idosoNome}>{currentAssistido.nome_completo}</Text>
            <Text style={styles.idosoIdade}>
              {currentAssistido.data_nascimento ? calcularIdade(currentAssistido.data_nascimento) + ' anos' : 'Idade não informada'}
            </Text>
          </View>
        )}

        {/* Lista de assistidos para seleção */}
        {!currentAssistido && assistidos.length > 0 && (
          <View style={styles.assistidosSection}>
            <Text style={styles.sectionTitle}>Selecione um assistido:</Text>
            {assistidos.map((assistido) => (
              <TouchableOpacity
                key={assistido.id}
                style={styles.assistidoCard}
                onPress={() => selecionarAssistido(assistido)}
              >
                <Text style={styles.assistidoNome}>{assistido.nome_completo}</Text>
                <Text style={styles.assistidoInfo}>
                  {assistido.telefone_1 || 'Telefone não informado'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading state */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3E8CE5" />
            <Text style={styles.loadingText}>Carregando assistidos...</Text>
          </View>
        )}

        {/* Empty state */}
        {!loading && assistidos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum assistido vinculado.</Text>
            <TouchableOpacity
              style={styles.adicionarButton}
              onPress={() => navigation.navigate('Cadastro')}
            >
              <Text style={styles.adicionarButtonText}>Adicionar Idoso</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Grid de funcionalidades */}
        <View style={styles.featureGrid}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => {
              if (!currentAssistido) {
                Alert.alert('Atenção', 'Selecione um assistido antes de prosseguir.');
                return;
              }
              navigation.navigate('Pulseira', { assistido: currentAssistido });
            }}
          >
            <Text style={styles.featureIcon}>⌚</Text>
            <Text style={styles.featureText}>Pulseira</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => {
              if (!currentAssistido) {
                Alert.alert('Atenção', 'Selecione um assistido antes de prosseguir.');
                return;
              }
              navigation.navigate('Historico', { assistido: currentAssistido });
            }}
          >
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Histórico</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => {
              if (!currentAssistido) {
                Alert.alert('Atenção', 'Selecione um assistido antes de prosseguir.');
                return;
              }
              navigation.navigate('Emergencia', { assistido: currentAssistido });
            }}
          >
            <Text style={styles.featureIcon}>🚨</Text>
            <Text style={styles.featureText}>Emergência</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => {
              if (!currentAssistido) {
                Alert.alert('Atenção', 'Selecione um assistido antes de prosseguir.');
                return;
              }
              navigation.navigate('ConfiguracaoEmergencia', { assistido: currentAssistido });
            }}
          >
            <Text style={styles.featureIcon}>⚙️</Text>
            <Text style={styles.featureText}>Config. Emergência</Text>
          </TouchableOpacity>
        </View>

        {/* Sending push notification indicator */}
        {sendingPush && (
          <View style={styles.pushNotificationContainer}>
            <Text style={styles.sendingText}>Registrando notificações...</Text>
          </View>
        )}
      </ScrollView>

      {/* Menu lateral */}
      <Animated.View 
        style={[
          styles.menuOverlay,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.menuContainer}>
          {/* Header do menu lateral */}
          <View style={styles.menuHeader}>
            <View style={styles.menuHeaderContent}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.menuItems}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigation(option.screen)}
              >
                <Text style={styles.menuItemIcon}>{option.icon}</Text>
                <Text style={styles.menuItemText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
            
            {/* Logout no menu */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={styles.menuItemText}>Sair</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>

      {/* Overlay para fechar o menu ao clicar fora */}
      {isMenuOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3E8CE5',
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
    height: 140,
  },
  hamburgerButton: {
    padding: 10,
  }, 
  hamburgerLine: {
    width: 25,
    height: 3,
    backgroundColor: 'white',
    marginVertical: 2,
    borderRadius: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 22,
  },
  idosoInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  idosoNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  idosoIdade: {
    fontSize: 16,
    color: '#1976d2',
  },
  assistidosSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  assistidoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  assistidoNome: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  assistidoInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    marginBottom: 12,
  },
  adicionarButton: {
    backgroundColor: '#3E8CE5',
    padding: 12,
    borderRadius: 10,
  },
  adicionarButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  pushNotificationContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  sendingText: {
    color: '#3E8CE5',
    fontSize: 12,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuContainer: {
    flex: 1,
  },
  menuHeader: {
    backgroundColor: '#3E8CE5',
    height: 185,
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  menuHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutMenuItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
});

export default Menu;