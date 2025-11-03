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
import { registerUser } from '../services/registerCuidService';

const Cadastro = ({ navigation }: { navigation: any }) => {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
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

  const converterDataParaBackend = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const salvarIdosoLocalmente = async (dadosBackend: any) => {
    try {
      // Buscar idosos existentes
      const idososSalvos = await AsyncStorage.getItem('@idosos_cadastrados');
      const idososArray = idososSalvos ? JSON.parse(idososSalvos) : [];

      // Criar novo idoso para salvar localmente
      const novoIdoso = {
        id: dadosBackend.id || `idoso-${Date.now()}`,
        nome: nome.trim(),
        dataNascimento: dataNascimento,
        telefone1: telefone1,
        telefone2: telefone2 || '',
        observacao: observacao.trim(),
        dataCadastro: new Date().toISOString()
      };

      // Adicionar à lista e salvar
      idososArray.push(novoIdoso);
      await AsyncStorage.setItem('@idosos_cadastrados', JSON.stringify(idososArray));
      
      console.log('Idoso salvo localmente:', novoIdoso);
      return novoIdoso;
    } catch (error) {
      console.error('Erro ao salvar idoso localmente:', error);
      throw error;
    }
  };

  const validarDataNascimento = (data: string) => {
    if (data.length < 10) return false;
    
    const [dia, mes, ano] = data.split('/');
    const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    
    // Verificar se a data é válida
    if (dataObj.getFullYear() !== parseInt(ano) || 
        dataObj.getMonth() !== parseInt(mes) - 1 || 
        dataObj.getDate() !== parseInt(dia)) {
      return false;
    }
    
    // Verificar se não é data futura
    if (dataObj > hoje) {
      return false;
    }
    
    // Verificar se a idade é razoável (menos de 150 anos)
    const idade = hoje.getFullYear() - dataObj.getFullYear();
    if (idade > 150 || idade < 0) {
      return false;
    }
    
    return true;
  };

  const handleConfirmar = async () => {
    // Validações
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o nome completo');
      return;
    }

    if (!dataNascimento.trim()) {
      Alert.alert('Atenção', 'Por favor, informe a data de nascimento');
      return;
    }

    if (!validarDataNascimento(dataNascimento)) {
      Alert.alert('Atenção', 'Por favor, insira uma data de nascimento válida (DD/MM/AAAA)');
      return;
    }

    const telefoneLimpo = telefone1.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) {
      Alert.alert('Atenção', 'Por favor, insira um telefone principal válido');
      return;
    }
    setLoading(true);

    try {
      const registerData = {
        nome_completo: nome.trim(),
        data_nascimento: converterDataParaBackend(dataNascimento),
        telefone_1: telefone1,
        observacoes: observacao.trim(),
        telefone_2: telefone2 || '',
      };

      console.log('Enviando dados para o backend:', registerData);

      // Registrar no backend
      const resultado = await registerUser(registerData);
      console.log('Resposta do backend:', resultado);
      
      // Salvar localmente no AsyncStorage
      await salvarIdosoLocalmente(resultado);
      
      Alert.alert(
        'Sucesso!',
        'Idoso cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('IdososCadastrados')
          }
        ]
      );
    } catch (error: any) {
      console.error('Erro completo no cadastro:', error);
      
      // Em caso de erro no backend, tentar salvar apenas localmente
      try {
        console.log('Tentando salvar apenas localmente...');
        await salvarIdosoLocalmente({});
        
        Alert.alert(
          'Cadastro Local',
          'Cadastro salvo localmente. Alguns recursos podem não funcionar sem conexão com o servidor.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('IdososCadastrados')
            }
          ]
        );
      } catch (localError) {
        Alert.alert(
          'Erro', 
          'Não foi possível salvar o cadastro. Verifique sua conexão e tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (nome || dataNascimento || telefone1) {
      Alert.alert(
        'Cancelar Cadastro',
        'Tem certeza que deseja cancelar? Os dados preenchidos serão perdidos.',
        [
          { text: 'Continuar Editando', style: 'cancel' },
          { 
            text: 'Cancelar', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
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
            placeholderTextColor="#666"
            autoCorrect={false}
            clearButtonMode="while-editing"
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/AAAA) *"
            value={dataNascimento}
            onChangeText={(text) => setDataNascimento(formatarData(text))}
            maxLength={10}
            keyboardType="numeric"
            placeholderTextColor="#666"
            clearButtonMode="while-editing"
          />

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Observações (alergias, medicamentos, condições especiais)"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone Principal *"
            value={telefone1}
            onChangeText={(text) => setTelefone1(formatarTelefone(text))}
            maxLength={15}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
            clearButtonMode="while-editing"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone Opcional"
            value={telefone2}
            onChangeText={(text) => setTelefone2(formatarTelefone(text))}
            maxLength={15}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
            clearButtonMode="while-editing"
          />

          <Text style={styles.obrigatorio}>* Campos obrigatórios</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelar}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleConfirmar}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
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
  confirmButton: {
    backgroundColor: '#3E8CE5',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3E8CE5',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#3E8CE5',
  },
});

export default Cadastro;