// Menu.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Idoso {
  id: string;
  nome: string;
  dataNascimento: string;
  telefone1: string;
  telefone2?: string;
  observacao?: string;
}

const Menu = ({ navigation, route }: { navigation: any; route: any }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [idosoSelecionado, setIdosoSelecionado] = useState<Idoso | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];
  const isFocused = useIsFocused();

  // Verificar autenticação ao carregar a tela
  useEffect(() => {
    verificarAutenticacao();
    
    // Configurar handler para botão voltar do Android
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isMenuOpen) {
          toggleMenu();
          return true;
        }
        // Não permitir voltar para login - só através do logout
        return true;
      }
    );

    return () => backHandler.remove();
  }, [isMenuOpen]);

  // Verificar autenticação quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      verificarAutenticacao();
      
      const idoso = route.params?.idosoSelecionado;
      console.log('Idoso recebido no Menu:', idoso);
      
      if (idoso) {
        setIdosoSelecionado(idoso);
      } else {
        // Se não recebeu idoso e está autenticado, tentar carregar do AsyncStorage
        carregarIdosoSalvo();
      }
      
      return () => {
        // Cleanup se necessário
      };
    }, [route.params?.idosoSelecionado])
  );

  const verificarAutenticacao = async () => {
    try {
      const userLoggedIn = await AsyncStorage.getItem('@user_logged_in');
      const currentUser = await AsyncStorage.getItem('@current_user');
      
      if (userLoggedIn === 'true' && currentUser) {
        setUsuarioLogado(true);
      } else {
        // Se não está autenticado, redirecionar para login
        setUsuarioLogado(false);
        Alert.alert(
          'Acesso Negado',
          'Por favor, faça login para acessar esta funcionalidade.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigation.navigate('Login');
    }
  };

  const carregarIdosoSalvo = async () => {
    try {
      const idosoSalvo = await AsyncStorage.getItem('@idoso_selecionado');
      if (idosoSalvo) {
        setIdosoSelecionado(JSON.parse(idosoSalvo));
      }
    } catch (error) {
      console.error('Erro ao carregar idoso salvo:', error);
    }
  };

  const salvarIdosoSelecionado = async (idoso: Idoso) => {
    try {
      await AsyncStorage.setItem('@idoso_selecionado', JSON.stringify(idoso));
    } catch (error) {
      console.error('Erro ao salvar idoso selecionado:', error);
    }
  };

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

  const menuOptions = [
    { title: 'Perfil do Idoso', screen: 'Perfil', icon: '👤' },
    { title: 'Pulseira', screen: 'Pulseira', icon: '⌚' },
    { title: 'Meu Histórico', screen: 'Historico', icon: '📊' },
    { title: 'Localização', screen: 'Localizacao', icon: '📍' },
    { title: 'Frequência Cardíaca', screen: 'BPM', icon: '❤️' },
    { title: 'Emergência', screen: 'Emergencia', icon: '🚨' },
    { title: 'Configurações', screen: 'Configuracoes', icon: '⚙️' },
  ];

  const handleNavigation = (screen: string) => {
    toggleMenu();
    
    setTimeout(() => {
      if (idosoSelecionado) {
        navigation.navigate(screen, { idosoSelecionado });
      } else {
        Alert.alert(
          'Atenção',
          'Nenhum idoso selecionado. Por favor, selecione um idoso primeiro.',
          [
            {
              text: 'Selecionar Idoso',
              onPress: () => navigation.navigate('IdososCadastrados')
            }
          ]
        );
      }
    }, 300);
  };

  const calcularIdade = (dataNascimento: string) => {
    try {
      const [dia, mes, ano] = dataNascimento.split('/');
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
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return 0;
    }
  };

  const handleVoltarIdosos = () => {
    navigation.navigate('IdososCadastrados');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da aplicação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpar dados de sessão
              await AsyncStorage.multiRemove([
                '@user_logged_in',
                '@current_user',
                '@idoso_selecionado'
              ]);
              
              // Redirecionar para login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              navigation.navigate('Login');
            }
          }
        }
      ]
    );
  };

  const featureCards = [
    { title: 'Pulseira', screen: 'Pulseira', icon: '⌚', color: '#3E8CE5' },
    { title: 'Frequência Cardíaca', screen: 'BPM', icon: '❤️', color: '#e74c3c' },
    { title: 'Localização', screen: 'Localizacao', icon: '📍', color: '#2ecc71' },
    { title: 'Emergência', screen: 'Emergencia', icon: '🚨', color: '#e67e22' },
    { title: 'Histórico', screen: 'Historico', icon: '📊', color: '#9b59b6' },
    { title: 'Perfil', screen: 'Perfil', icon: '👤', color: '#34495e' },
  ];

  const navigateToFeature = (screen: string) => {
    if (idosoSelecionado) {
      navigation.navigate(screen, { idosoSelecionado });
    } else {
      Alert.alert(
        'Selecione um Idoso',
        'Por favor, selecione um idoso primeiro.',
        [
          {
            text: 'Selecionar Idoso',
            onPress: () => navigation.navigate('IdososCadastrados')
          }
        ]
      );
    }
  };

  // Se não está autenticado, não renderiza o conteúdo
  if (!usuarioLogado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Verificando autenticação...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity style={styles.headerRight} onPress={handleVoltarIdosos}>
          <Text style={styles.voltarText}>Trocar Idoso</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Bem-vindo ao BioAlert</Text>
        <Text style={styles.subtitle}>
          Monitoramento inteligente para segurança e bem-estar.
        </Text>
        
        {/* Seção do idoso selecionado */}
        {idosoSelecionado ? (
          <View style={styles.idosoInfo}>
            <View style={styles.idosoAvatar}>
              <Text style={styles.idosoAvatarText}>
                {idosoSelecionado.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <View style={styles.idosoDetails}>
              <Text style={styles.idosoNome}>{idosoSelecionado.nome}</Text>
              <Text style={styles.idosoIdade}>
                {calcularIdade(idosoSelecionado.dataNascimento)} anos
              </Text>
              <Text style={styles.idosoTelefone}>
                {idosoSelecionado.telefone1}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noIdoso}>
            <Text style={styles.noIdosoText}>Nenhum idoso selecionado</Text>
            <Text style={styles.noIdosoSubtext}>
              Para acessar as funcionalidades, selecione um idoso cadastrado
            </Text>
            <TouchableOpacity 
              style={styles.selectIdosoButton}
              onPress={handleVoltarIdosos}
            >
              <Text style={styles.selectIdosoButtonText}>Selecionar Idoso</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Grid de funcionalidades - Só mostra se tiver idoso selecionado */}
        {idosoSelecionado && (
          <>
            <Text style={styles.featuresTitle}>Funcionalidades</Text>
            <View style={styles.featureGrid}>
              {featureCards.map((feature, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[styles.featureCard, { backgroundColor: feature.color }]}
                  onPress={() => navigateToFeature(feature.screen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status do sistema */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusTitle}>Status do Sistema</Text>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.statusOnline]} />
                <Text style={styles.statusText}>Pulseira conectada</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.statusOnline]} />
                <Text style={styles.statusText}>Monitoramento ativo</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.statusOk]} />
                <Text style={styles.statusText}>Sinais vitais normais</Text>
              </View>
            </View>
          </>
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
            {idosoSelecionado && (
              <View style={styles.menuIdosoInfo}>
                <Text style={styles.menuIdosoNome}>{idosoSelecionado.nome}</Text>
                <Text style={styles.menuIdosoIdade}>
                  {calcularIdade(idosoSelecionado.dataNascimento)} anos
                </Text>
              </View>
            )}
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
            
            {/* Separador */}
            <View style={styles.menuSeparator} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleVoltarIdosos}
            >
              <Text style={styles.menuItemIcon}>👥</Text>
              <Text style={styles.menuItemText}>Trocar Idoso</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
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
    padding: 8,
  },
  voltarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  idosoAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  idosoAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  idosoDetails: {
    flex: 1,
  },
  idosoNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  idosoIdade: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 2,
  },
  idosoTelefone: {
    fontSize: 14,
    color: '#1976d2',
    opacity: 0.8,
  },
  noIdoso: {
    backgroundColor: '#fff3cd',
    padding: 25,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noIdosoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  noIdosoSubtext: {
    fontSize: 16,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  selectIdosoButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectIdosoButtonText: {
    color: '#856404',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#3E8CE5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: 'white',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusOnline: {
    backgroundColor: '#28a745',
  },
  statusOk: {
    backgroundColor: '#17a2b8',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
    marginBottom: 15,
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
  menuIdosoInfo: {
    paddingHorizontal: 15,
  },
  menuIdosoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  menuIdosoIdade: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
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
  menuSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
    marginHorizontal: 20,
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