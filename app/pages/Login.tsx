import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar se já existe um cuidador cadastrado ao carregar a tela
  useEffect(() => {
    checkExistingCuidador();
  }, []);

  const checkExistingCuidador = async () => {
    try {
      const cuidadorSalvo = await AsyncStorage.getItem('@cuidador_data');
      if (cuidadorSalvo) {
        const cuidador = JSON.parse(cuidadorSalvo);
        console.log('Cuidador encontrado:', cuidador.email);
      } else {
        console.log('Nenhum cuidador cadastrado encontrado');
      }
    } catch (error) {
      console.error('Erro ao verificar cuidador:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    setLoading(true);

    try {
      // Buscar dados do cuidador salvos
      const cuidadorSalvo = await AsyncStorage.getItem('@cuidador_data');
      
      if (cuidadorSalvo) {
        const cuidador = JSON.parse(cuidadorSalvo);
        
        console.log('Tentando login com:', { email: email.toLowerCase(), senha });
        console.log('Dados salvos:', { email: cuidador.email, senha: cuidador.senha });
        
        // Verificar credenciais (case insensitive para email)
        if (email.toLowerCase() === cuidador.email.toLowerCase() && senha === cuidador.senha) {
          // Salvar sessão de login
          await AsyncStorage.setItem('@user_logged_in', 'true');
          await AsyncStorage.setItem('@current_user', JSON.stringify(cuidador));
          
          Alert.alert('Sucesso', `Bem-vindo(a), ${cuidador.nome_completo}!`, [
            {
              text: 'OK',
              onPress: () => navigation.navigate('IdososCadastrados')
            }
          ]);
        } else {
          Alert.alert('Erro', 'Email ou senha incorretos');
        }
      } else {
        Alert.alert(
          'Cadastro Necessário', 
          'Nenhum cuidador cadastrado encontrado. Por favor, faça o cadastro primeiro.',
          [
            {
              text: 'Cadastrar',
              onPress: () => navigation.navigate('CadastroCuidador')
            },
            {
              text: 'Cancelar',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEsqueciSenha = () => {
    Alert.alert(
      'Recuperar Senha',
      'Entre em contato com o suporte para redefinir sua senha.',
      [{ text: 'OK' }]
    );
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
            editable={!loading}
          />

          <View style={styles.senhaContainer}>
            <TextInput
              style={styles.senhaInput}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              placeholderTextColor="#666"
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
              disabled={loading}
            >
              <Image 
                source={mostrarSenha 
                  ? require('../assets/eye-closed.png')
                  : require('../assets/eye-open.png') 
                }
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.esqueciSenhaButton}
            onPress={handleEsqueciSenha}
          >
            <Text style={styles.esqueciSenhaText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('CadastroCuidador')}
            disabled={loading}
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
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
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
  esqueciSenhaButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  esqueciSenhaText: {
    color: '#3E8CE5',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3E8CE5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
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