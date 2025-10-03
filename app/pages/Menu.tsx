import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Menu = ({ navigation }: { navigation: any }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];

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
    { title: 'Perfil', screen: 'Perfil', icon: '👤' },
    { title: 'Pulseira', screen: 'Pulseira', icon: '⌚' },
    { title: 'Meu Histórico', screen: 'Historico', icon: '📊' },
    { title: 'Localização', screen: 'Localizacao', icon: '📍' },
    { title: 'BPM', screen: 'BPM', icon: '❤️' },
    { title: 'Emergência', screen: 'Emergencia', icon: '🚨' },
  ];

  const handleNavigation = (screen: string) => {
    toggleMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 300);
  };

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
        
        <View style={styles.featureGrid}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Pulseira')}
          >
            <Text style={styles.featureIcon}>⌚</Text>
            <Text style={styles.featureText}>Pulseira</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('BPM')}
          >
            <Text style={styles.featureIcon}>❤️</Text>
            <Text style={styles.featureText}>BPM</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Localizacao')}
          >
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>Localização</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Emergencia')}
          >
            <Text style={styles.featureIcon}>🚨</Text>
            <Text style={styles.featureText}>Emergência</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Menu lateral */}
      <Animated.View 
        style={[
          styles.menuOverlay,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.menuContainer}>
          {/* Header do menu lateral com mesma altura e estilo */}
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
    paddingVertical: 15,
    height: 120,
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
    height: 165, // Mesma altura do header principal
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