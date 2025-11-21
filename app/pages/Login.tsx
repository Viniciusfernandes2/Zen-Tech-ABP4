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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginUser } from '../services/loginService';
import { saveAuthToken, saveUserProfile } from '../api/axios';

const Login = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Erro', 'Email inválido.');
      return;
    }

    try {
      setLoading(true);

      // Chamada real ao backend
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        senha,
      });

      // Backend retorna: { token, usuario }
      if (!response?.token) {
        Alert.alert('Erro', 'Resposta inválida do servidor.');
        return;
      }

      // Salvar token e usuário conforme axios.ts
      await saveAuthToken(response.token);
      await saveUserProfile(JSON.stringify(response.usuario));

      Alert.alert('Sucesso', 'Login realizado com sucesso!', [
        {
          text: 'Continuar',
          onPress: () => navigation.replace('IdososCadastrados'),
        },
      ]);
    } catch (error: any) {
      console.error('[Login] erro:', error);

      const msg =
        error?.response?.data?.message ||
        'Não foi possível fazer login. Verifique suas credenciais.';

      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEsqueciSenha = () => {
    Alert.alert(
      'Recuperar Senha',
      'Entre em contato com o suporte para redefinir sua senha.',
      [{ text: 'OK' }],
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
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor="#666"
            keyboardType="email-address"
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
            >
              <Image
                source={
                  mostrarSenha
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
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
  senhaInput: { flex: 1, padding: 15, fontSize: 16, color: '#000' },
  eyeButton: { padding: 8, marginRight: 5 },
  eyeIcon: { width: 24, height: 24 },
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
  buttonDisabled: { backgroundColor: '#9E9E9E' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  registerButton: { alignItems: 'center', padding: 10 },
  registerButtonText: {
    color: '#3E8CE5',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;
