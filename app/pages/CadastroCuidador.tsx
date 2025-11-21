import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { registerUser } from '../services/registerUserService';

const CadastroCuidador = ({ navigation }: { navigation: any }) => {
  const [nome_completo, setNomeCompleto] = useState('');
  const [data_nascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formata DD/MM/AAAA
  const formatarData = (text: string) => {
    const numbers = text.replace(/\D/g, '');

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const formatarTelefone = (text: string) => {
    const numbers = text.replace(/\D/g, '');

    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    }
    return numbers
      .replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3')
      .replace(/-$/, '');
  };

  const validarEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarDataNascimento = (data: string) => {
    if (data.length !== 10) return false;

    const [dia, mes, ano] = data.split('/');
    const dt = new Date(`${ano}-${mes}-${dia}`);

    const hoje = new Date();
    const idade = hoje.getFullYear() - dt.getFullYear();

    return idade >= 18 && idade <= 120;
  };

  // Converte para YYYY-MM-DD (backend)
  const converterDataParaBackend = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const handleConfirmar = async () => {
    if (!nome_completo.trim() || !data_nascimento.trim() || !email.trim() || !telefone.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Atenção', 'Email inválido.');
      return;
    }

    if (!validarDataNascimento(data_nascimento)) {
      Alert.alert('Atenção', 'Data de nascimento inválida.');
      return;
    }

    const telLimpo = telefone.replace(/\D/g, '');
    if (telLimpo.length < 10) {
      Alert.alert('Atenção', 'Telefone inválido.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nome_completo: nome_completo.trim(),
        data_nascimento: converterDataParaBackend(data_nascimento),
        telefone: telLimpo,
        email: email.trim().toLowerCase(),
        senha,
      };

      console.log('[Cadastro Cuidador] Enviando dados:', payload);

      // Chamada real ao backend
      const result = await registerUser(payload);

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      console.error('[Cadastro Cuidador] Erro:', error);

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.erro ||
        'Não foi possível completar o cadastro.';

      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image source={require('../assets/cadastro.png')} style={styles.logo} />

          <Text style={styles.title}>Cadastro do Cuidador</Text>
          <Text style={styles.subtitle}>Preencha os dados do cuidador principal</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome Completo *"
            value={nome_completo}
            onChangeText={setNomeCompleto}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/AAAA) *"
            value={data_nascimento}
            onChangeText={(t) => setDataNascimento(formatarData(t))}
            keyboardType="numeric"
            maxLength={10}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone *"
            value={telefone}
            onChangeText={(t) => setTelefone(formatarTelefone(t))}
            keyboardType="phone-pad"
            maxLength={15}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#666"
          />

          <View style={styles.senhaContainer}>
            <TextInput
              style={styles.senhaInput}
              placeholder="Senha *"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
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

          <Text style={styles.obrigatorio}>* Todos os campos são obrigatórios</Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleConfirmar}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Confirmar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Já tem uma conta? Faça login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 30 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1.5,
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
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
  },
  senhaInput: { flex: 1, padding: 15, fontSize: 16, color: '#000' },
  eyeButton: { padding: 8, marginRight: 5 },
  eyeIcon: { width: 24, height: 24 },
  obrigatorio: { fontSize: 14, color: '#666', marginBottom: 10, fontStyle: 'italic' },
  button: {
    backgroundColor: '#3E8CE5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: { backgroundColor: '#9E9E9E' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  loginButton: { alignItems: 'center', marginTop: 5 },
  loginButtonText: { color: '#3E8CE5', fontSize: 16, fontWeight: '600' },
});

export default CadastroCuidador;
