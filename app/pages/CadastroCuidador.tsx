import React, { useState } from 'react';
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CadastroCuidador = ({ navigation }: { navigation: any }) => {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

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
    if (!nome.trim() || !dataNascimento.trim() || !parentesco.trim() || !email.trim() || !telefone.trim()) {
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

    Alert.alert(
      'Confirmação',
      'Dados do cuidador salvos com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Menu')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
        />

        <TextInput
          style={styles.input}
          placeholder="Data de Nascimento (DD/MM/AAAA) *"
          value={dataNascimento}
          onChangeText={(text) => setDataNascimento(formatarData(text))}
          maxLength={10}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Parentesco *"
          value={parentesco}
          onChangeText={setParentesco}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone *"
          value={telefone}
          onChangeText={(text) => setTelefone(formatarTelefone(text))}
          maxLength={15}
          keyboardType="phone-pad"
        />

        <Text style={styles.obrigatorio}>* Todos os campos são obrigatórios</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirmar}
        >
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CadastroCuidador;