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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser } from '../services/registerUserService'; // 👈 importa sua função da service

const CadastroCuidador = ({ navigation }: { navigation: any }) => {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false); // estado para mostrar o carregamento

  // --- formatações ---
  const formatarData = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const formatarTelefone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      return numbers.replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
  };

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- função de cadastro integrada com a API ---
  const handleConfirmar = async () => {
    if (!nome.trim() || !dataNascimento.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert('Atenção', 'Por favor, insira um email válido');
      return;
    }
    if (dataNascimento.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira uma data de nascimento válida (DD/MM/AAAA)');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // 👇 Aqui está a chamada ao seu service
      const response = await registerUser({
        nome_completo: nome,
        data_nascimento: dataNascimento,
        email,
        senha
      });

      console.log('Usuário cadastrado:', response);

      Alert.alert(
        'Sucesso',
        'Cadastro realizado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      Alert.alert('Erro', error.message || 'Falha ao cadastrar. Tente novamente.');
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
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/AAAA) *"
            value={dataNascimento}
            onChangeText={(text) => setDataNascimento(formatarData(text))}
            maxLength={10}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <View style={styles.senhaContainer}>
            <TextInput
              style={styles.senhaInput}
              placeholder="Senha *"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Image 
                source={
                  mostrarSenha 
                    ? require('../assets/eye-open.png') 
                    : require('../assets/eye-closed.png')
                }
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.obrigatorio}>* Todos os campos são obrigatórios</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleConfirmar}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirmar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- estilos (mantidos os seus) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
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
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#000',
  },
  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  senhaInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
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
    width: '100%',
    textAlign: 'left',
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
    width: '100%',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CadastroCuidador;
