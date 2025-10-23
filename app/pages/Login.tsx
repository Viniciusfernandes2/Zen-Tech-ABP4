import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    // Simulação de login bem-sucedido
    Alert.alert('Sucesso', 'Login realizado com sucesso!', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('IdososCadastrados') // Alterado para ir para IdososCadastrados
      }
    ]);
  };

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image
            source={require('../assets/pulseira-icon-sos.png')}
            style={styles.logo}
          />
          
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Entre com sua conta</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor="#666"
          />

          <View style={styles.senhaContainer}>
            <TextInput
              style={styles.senhaInput}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              placeholderTextColor="#666"
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Image 
                source={mostrarSenha 
                  ? require('../assets/eye-open.png') 
                  : require('../assets/eye-closed.png')
                }
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('CadastroCuidador')}
          >
            <Text style={styles.registerButtonText}>
              Não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
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
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#555',
    borderRadius: 10,
    marginBottom: 15,
  },
  senhaInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 8,
    marginRight: 5,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  button: {
    backgroundColor: '#3E8CE5',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    alignItems: 'center',
    padding: 10,
  },
  registerButtonText: {
    color: '#3E8CE5',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;