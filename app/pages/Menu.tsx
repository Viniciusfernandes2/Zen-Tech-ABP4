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
  Linking,
  Image,
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

  // Menu options - ADICIONADO "Trocar de Idoso"
  const menuOptions = [
    { title: 'Trocar de Idoso', screen: 'IdososCadastrados', icon: '🔄' },
    { title: 'Perfil', screen: 'Perfil', icon: '👤' },
    { title: 'Pulseira', screen: 'Pulseira', icon: '⌚' },
    { title: 'Meu Histórico', screen: 'Historico', icon: '📊' },
  ];

  const handleNavigation = (screen: string) => {
    toggleMenu();
    setTimeout(() => {
      if (screen === 'IdososCadastrados') {
        navigation.navigate('IdososCadastrados');
        return;
      }
      
      if (!currentAssistido && screen !== 'Perfil') {
        Alert.alert('Atenção', 'Selecione um assistido antes de prosseguir.');
        return;
      }
      navigation.navigate(screen, { assistido: currentAssistido });
    }, 300);
  };

  // Ligar para o SAMU
  const handleLigarSamu = () => {
    Alert.alert(
      'Ligar para o SAMU',
      'Deseja ligar para o Serviço de Atendimento Móvel de Urgência (192)?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Ligar',
          onPress: () => {
            Linking.openURL('tel:192');
          },
        },
      ]
    );
  };

  // Determinar gênero pelo nome (aproximação simples)
  const determinarGenero = (nome: string) => {
    const nomeLower = nome.toLowerCase();
    // Lista de sufixos tipicamente femininos
    const sufixosFemininos = ['a', 'e', 'i', 'ia', 'ea', 'na', 'da', 'ra'];
    const ultimaLetra = nomeLower.charAt(nomeLower.length - 1);
    
    // Verifica se o nome termina com sufixos femininos comuns
    if (sufixosFemininos.includes(ultimaLetra)) {
      return 'feminino';
    }
    
    // Nomes específicos que podem ser exceções
    const nomesFemininos = ['maria', 'ana', 'clara', 'sofia', 'julia', 'laura', 'isabel', 'beatriz'];
    const primeiroNome = nomeLower.split(' ')[0];
    
    if (nomesFemininos.includes(primeiroNome)) {
      return 'feminino';
    }
    
    // Padrão como fallback para masculino
    return 'masculino';
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

  // 🔥 VERIFICAÇÃO DE PERMISSÃO DE NOTIFICAÇÕES
  const verificarPermissaoNotificacoes = async () => {
    try {
      console.log('[Menu] Verificando permissão de notificações...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('[Menu] Status atual da permissão:', existingStatus);
      
      if (existingStatus !== 'granted') {
        console.log('[Menu] Solicitando permissão...');
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('[Menu] Novo status da permissão:', status);
        
        if (status === 'granted') {
          console.log('[Menu] ✅ Permissão concedida!');
          return true;
        } else {
          console.log('[Menu] ❌ Permissão negada');
          return false;
        }
      } else {
        console.log('[Menu] ✅ Permissão já concedida');
        return true;
      }
    } catch (error) {
      console.error('[Menu] Erro ao verificar permissão:', error);
      return false;
    }
  };

  // 🔥 PUSH NOTIFICATIONS - VERSÃO ATUALIZADA
  const registerForPushNotificationsAsync = async () => {
    try {
      setSendingPush(true);
      console.log('[Menu] Iniciando registro de push notifications...');
      
      // 🔥 SEMPRE VERIFICAR PERMISSÃO PRIMEIRO
      const permissaoConcedida = await verificarPermissaoNotificacoes();
      
      if (!permissaoConcedida) {
        console.log('[Menu] ❌ Permissão negada, abortando registro');
        setSendingPush(false);
        return;
      }

      // 🔥 SEMPRE OBTER TOKEN ATUAL (NÃO CONFIAR NO CACHE)
      console.log('[Menu] Obtendo token atual...');
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoToken = tokenData.data;
      console.log('[Menu] ✅ Token atual obtido:', expoToken);

      // 🔥 VERIFICAR SE TOKEN MUDOU
      const savedToken = await AsyncStorage.getItem('@expo_push_token');
      console.log('[Menu] Token salvo anteriormente:', savedToken);
      
      if (savedToken !== expoToken) {
        console.log('[Menu] 🔄 Token mudou, atualizando no backend...');
        try {
          await api.post('/usuarios/push-token', { expo_push_token: expoToken });
          await AsyncStorage.setItem('@expo_push_token', expoToken);
          console.log('[Menu] ✅ Token atualizado no backend e localmente');
        } catch (err: any) {
          console.error('[Menu] ❌ Erro ao atualizar token:', err?.message ?? err);
        }
      } else {
        console.log('[Menu] ✅ Token já está atualizado');
      }

      // 🔥 DIAGNÓSTICO: VERIFICAR TOKEN NO BACKEND
      try {
        console.log('[Menu] Verificando token no backend...');
        // Aqui você pode adicionar uma chamada para verificar se o token está realmente salvo
      } catch (error) {
        console.error('[Menu] Erro na verificação do backend:', error);
      }

    } catch (err) {
      console.error('[Menu] ❌ Erro no registro de push notifications:', err);
    } finally {
      setSendingPush(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@bioalert_token');
      await AsyncStorage.removeItem('@bioalert_user');
      await AsyncStorage.removeItem(ASSISTIDO_KEY);
      await AsyncStorage.removeItem('@expo_push_token'); // 🔥 Limpar token também
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
        // 🔥 SEMPRE REGISTRAR/ATUALIZAR TOKEN QUANDO O MENU ABRIR
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
      
      {/* Header modernizado com logo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hamburgerButton} onPress={toggleMenu}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>BioAlert</Text>
          {currentAssistido && (
            <Text style={styles.headerSubtitle}>
              {currentAssistido.nome_completo}
            </Text>
          )}
        </View>
        
        {/* Logo no lugar do ícone de perfil */}
        <Image 
          source={require('../assets/pulseira-icon-sos.png')} 
          style={styles.logoHeader}
        />
      </View>

      {/* Conteúdo principal modernizado */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bem-vindo ao BioAlert</Text>
          <Text style={styles.subtitle}>
            Monitoramento inteligente para segurança e bem-estar do idoso.
          </Text>
        </View>
        
        {/* Seção do assistido selecionado com ícone de gênero */}
        {currentAssistido && (
          <View style={styles.idosoInfo}>
            <View style={[
              styles.idosoIconContainer,
              determinarGenero(currentAssistido.nome_completo) === 'feminino' 
                ? styles.feminino 
                : styles.masculino
            ]}>
              <Text style={styles.idosoIcon}>
                {determinarGenero(currentAssistido.nome_completo) === 'feminino' ? '👩' : '👨'}
              </Text>
            </View>
            <View style={styles.idosoDetails}>
              <Text style={styles.idosoNome}>{currentAssistido.nome_completo}</Text>
              <Text style={styles.idosoIdade}>
                {currentAssistido.data_nascimento ? 
                  `${calcularIdade(currentAssistido.data_nascimento)} anos` : 
                  'Idade não informada'
                }
              </Text>
            </View>
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
            <Text style={styles.emptyIcon}>👴</Text>
            <Text style={styles.emptyText}>Nenhum assistido vinculado</Text>
            <Text style={styles.emptySubtext}>
              Adicione um idoso para começar o monitoramento
            </Text>
            <TouchableOpacity
              style={styles.adicionarButton}
              onPress={() => navigation.navigate('Cadastro')}
            >
              <Text style={styles.adicionarButtonText}>Adicionar Idoso</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Grid de funcionalidades modernizada */}
        {currentAssistido && (
          <View style={styles.featureSection}>
            <Text style={styles.sectionTitle}>Funcionalidades</Text>
            <View style={styles.featureGrid}>
              {/* Linha com Pulseira e Histórico lado a lado */}
              <View style={styles.featureRow}>
                {/* Pulseira na esquerda - 48% */}
                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => navigation.navigate('Pulseira', { assistido: currentAssistido })}
                >
                  <View style={[styles.featureIconContainer, styles.pulseiraIcon]}>
                    <Text style={styles.featureIcon}>⌚</Text>
                  </View>
                  <Text style={styles.featureText}>Pulseira</Text>
                  <Text style={styles.featureDescription}>Gerenciar dispositivo</Text>
                </TouchableOpacity>
                
                {/* Histórico na direita - 48% */}
                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => navigation.navigate('Historico', { assistido: currentAssistido })}
                >
                  <View style={[styles.featureIconContainer, styles.historicoIcon]}>
                    <Text style={styles.featureIcon}>📊</Text>
                  </View>
                  <Text style={styles.featureText}>Histórico</Text>
                  <Text style={styles.featureDescription}>Ver eventos</Text>
                </TouchableOpacity>
              </View>

              {/* Card do SAMU aumentado - 100% */}
              <TouchableOpacity 
                style={styles.samuCard}
                onPress={handleLigarSamu}
              >
                <View style={styles.samuContent}>
                  <View style={styles.samuIconContainer}>
                    <Text style={styles.samuIcon}>🚑</Text>
                  </View>
                  <View style={styles.samuTextContainer}>
                    <Text style={styles.samuTitle}>SAMU</Text>
                    <Text style={styles.samuDescription}>Serviço de Atendimento Móvel de Urgência</Text>
                    <Text style={styles.samuNumber}>Ligar para 192</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sending push notification indicator */}
        {sendingPush && (
          <View style={styles.pushNotificationContainer}>
            <ActivityIndicator size="small" color="#3E8CE5" />
            <Text style={styles.sendingText}>Atualizando notificações...</Text>
          </View>
        )}
      </ScrollView>

      {/* Menu lateral (mantido igual) */}
      <Animated.View 
        style={[
          styles.menuOverlay,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View style={styles.menuHeaderContent}>
              <View style={styles.menuTitleContainer}>
                <Text style={styles.menuTitle}>Menu</Text>
                {currentAssistido && (
                  <Text style={styles.idosoSelecionadoText}>
                    {currentAssistido.nome_completo}
                  </Text>
                )}
              </View>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3E8CE5',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    height: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  hamburgerButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  }, 
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: 'white',
    marginVertical: 2,
    borderRadius: 2,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  logoHeader: {
    width: 40,
    height: 40,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    lineHeight: 22,
    maxWidth: 300,
  },
  idosoInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  idosoIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  masculino: {
    backgroundColor: '#dbeafe',
  },
  feminino: {
    backgroundColor: '#fce7f3',
  },
  idosoIcon: {
    fontSize: 32,
  },
  idosoDetails: {
    flex: 1,
  },
  idosoNome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  idosoIdade: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  assistidosSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1e293b',
  },
  assistidoCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  assistidoNome: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  assistidoInfo: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  adicionarButton: {
    backgroundColor: '#3E8CE5',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adicionarButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  featureSection: {
    marginTop: 8,
  },
  featureGrid: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseiraIcon: {
    backgroundColor: '#e0f2fe',
  },
  historicoIcon: {
    backgroundColor: '#f0f9ff',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  // Estilos para o card do SAMU aumentado
  samuCard: {
    backgroundColor: '#fef2f2',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  samuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  samuIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  samuIcon: {
    fontSize: 36,
  },
  samuTextContainer: {
    flex: 1,
  },
  samuTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#dc2626',
    marginBottom: 4,
  },
  samuDescription: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 8,
    fontWeight: '500',
  },
  samuNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
  },
  pushNotificationContainer: {
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  menuTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  idosoSelecionadoText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    opacity: 0.9,
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
    borderBottomColor: '#f1f5f9',
  },
  logoutMenuItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 24,
  },
  menuItemText: {
    fontSize: 18,
    color: '#334155',
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