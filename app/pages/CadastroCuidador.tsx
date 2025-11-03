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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../services/registerUserService';

const CadastroCuidador = ({ navigation }: { navigation: any }) => {
  const [nome_completo, setNomeCompleto] = useState('');
  const [data_nascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatarData = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const formatarTelefone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    } else {
      return numbers
        .replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    }
  };

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarDataNascimento = (data: string) => {
    if (data.length < 10) return false;
    
    const [dia, mes, ano] = data.split('/');
    const dataObj = new Date(`${ano}-${mes}-${dia}`);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataObj.getFullYear();
    
    return idade >= 18 && idade <= 120;
  };

  const converterDataParaBackend = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const handleConfirmar = async () => {
    // Validações básicas
    if (!nome_completo.trim() || !data_nascimento.trim() || !email.trim() || !telefone.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('Atenção', 'Por favor, insira um email válido');
      return;
    }

    if (data_nascimento.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira uma data de nascimento válida (DD/MM/AAAA)');
      return;
    }

    if (!validarDataNascimento(data_nascimento)) {
      Alert.alert('Atenção', 'Você deve ter pelo menos 18 anos para se cadastrar');
      return;
    }

    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira um telefone válido');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const dadosUsuario = {
        nome_completo: nome_completo.trim(),
        data_nascimento: converterDataParaBackend(data_nascimento),
        telefone: telefoneLimpo,
        email: email.trim().toLowerCase(),
        senha: senha
      };

      console.log('Enviando dados para cadastro:', dadosUsuario);
      
      // Registrar na API
      const resultado = await registerUser(dadosUsuario);
      
      // Salvar dados localmente para login
      const cuidadorData = {
        id: resultado.id || Date.now().toString(),
        nome_completo: nome_completo.trim(),
        email: email.trim().toLowerCase(),
        senha: senha,
        telefone: telefoneLimpo,
        data_nascimento: data_nascimento
      };
      
      await AsyncStorage.setItem('@cuidador_data', JSON.stringify(cuidadorData));
      console.log('Dados salvos localmente:', cuidadorData);
      
      Alert.alert(
        'Sucesso',
        'Cadastro realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error: any) {
      console.error('Erro completo no cadastro:', error);
      Alert.alert('Erro', error.message || 'Não foi possível realizar o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image 
            source={require('../assets/cadastro.png')} 
            style={styles.logo}
          />
          <Text style={styles.title}>Cadastro do Cuidador</Text>
          <Text style={styles.subtitle}>Preencha os dados do cuidador principal</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome Completo *"
            value={nome_completo}
            onChangeText={setNomeCompleto}
            placeholderTextColor="#666"
            autoCorrect={false}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/AAAA) *"
            value={data_nascimento}
            onChangeText={(text) => setDataNascimento(formatarData(text))}
            maxLength={10}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone *"
            value={telefone}
            onChangeText={(text) => setTelefone(formatarTelefone(text))}
            maxLength={15}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
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
              placeholder="Senha *"
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
                  ? require('../assets/eye-closed.png')
                  : require('../assets/eye-open.png') 
                }
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.obrigatorio}>* Todos os campos são obrigatórios</Text>
          <Text style={styles.observacao}>A senha deve ter pelo menos 6 caracteres</Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleConfirmar}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Confirmar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              Já tem uma conta? Faça login
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
    padding: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
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
  obrigatorio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  observacao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#3E8CE5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
    padding: 10,
  },
  loginButtonText: {
    color: '#3E8CE5',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CadastroCuidador;