// CadastroCuidador.tsx
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

const CadastroCuidador = ({ navigation }: { navigation: any }) => {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

  const handleConfirmar = () => {
    if (!nome.trim() || !dataNascimento.trim() || !parentesco.trim() || !email.trim() || !telefone.trim() || !senha.trim()) {
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

    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira um telefone válido');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    Alert.alert(
      'Confirmação',
      'Cadastro realizado com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
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
            autoCorrect={false}
            clearButtonMode="while-editing"
          />

          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/AAAA) *"
            value={dataNascimento}
            onChangeText={(text) => setDataNascimento(formatarData(text))}
            maxLength={10}
            keyboardType="numeric"
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />

          <TextInput
            style={styles.input}
            placeholder="Parentesco *"
            value={parentesco}
            onChangeText={setParentesco}
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone *"
            value={telefone}
            onChangeText={(text) => setTelefone(formatarTelefone(text))}
            maxLength={15}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
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
                source={mostrarSenha 
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
          >
            <Text style={styles.buttonText}>Confirmar</Text>
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
    marginRight: 5, // Adicionado para mover o ícone mais para a esquerda
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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