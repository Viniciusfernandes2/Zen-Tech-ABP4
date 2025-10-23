import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cadastro = ({ navigation }: { navigation: any }) => {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');

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

  const handleConfirmar = async () => {
    if (!nome.trim() || !dataNascimento.trim() || !telefone1.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (dataNascimento.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira uma data de nascimento válida (DD/MM/AAAA)');
      return;
    }

    const telefoneLimpo = telefone1.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira um telefone principal válido');
      return;
    }

    try {
      // Criar objeto do idoso
      const novoIdoso = {
        id: Date.now().toString(),
        nome: nome.trim(),
        dataNascimento: dataNascimento,
        observacao: observacao.trim(),
        telefone1: telefone1,
        telefone2: telefone2 || '',
      };

      // Salvar no AsyncStorage
      const idososExistentes = await AsyncStorage.getItem('@idosos_cadastrados');
      let idososArray = idososExistentes ? JSON.parse(idososExistentes) : [];
      idososArray.push(novoIdoso);
      await AsyncStorage.setItem('@idosos_cadastrados', JSON.stringify(idososArray));

      // Navegar para a tela de idosos cadastrados
      navigation.navigate('IdososCadastrados');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados do idoso');
      console.error('Erro ao salvar idoso:', error);
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
          <Text style={styles.title}>Cadastro do Idoso</Text>
          <Text style={styles.subtitle}>Preencha os dados pessoais</Text>

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
            style={[styles.input, styles.multilineInput]}
            placeholder="Observação *"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone Principal *"
            value={telefone1}
            onChangeText={(text) => setTelefone1(formatarTelefone(text))}
            maxLength={15}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone Opcional"
            value={telefone2}
            onChangeText={(text) => setTelefone2(formatarTelefone(text))}
            maxLength={15}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />

          <Text style={styles.obrigatorio}>* Campos obrigatórios</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleConfirmar}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continuar</Text>
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
    width: 80,
    height: 80,
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
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

export default Cadastro;