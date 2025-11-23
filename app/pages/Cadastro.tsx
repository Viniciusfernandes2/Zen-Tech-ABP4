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
import { criarAssistidoApi } from '../services/assistidosService';

const Cadastro = ({ navigation }: { navigation: any }) => {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [loading, setLoading] = useState(false);

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

  const converterDataParaBackend = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const validarDataNascimento = (data: string) => {
    if (data.length < 10) return false;
    const [dia, mes, ano] = data.split('/');
    const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataObj.getFullYear();
    return idade > 0 && idade < 120;
  };

  const handleConfirmar = async () => {
    if (!nome.trim()) return Alert.alert('Erro', 'Informe o nome.');
    if (!dataNascimento.trim()) return Alert.alert('Erro', 'Informe a data.');
    if (!validarDataNascimento(dataNascimento))
      return Alert.alert('Erro', 'Data inválida.');

    const tel1 = telefone1.replace(/\D/g, '');
    if (tel1.length < 10) return Alert.alert('Erro', 'Telefone inválido.');

    try {
      setLoading(true);

      const payload = {
        nome_completo: nome.trim(),
        data_nascimento: converterDataParaBackend(dataNascimento),
        telefone_1: telefone1,
        telefone_2: telefone2 || '',
        observacoes: observacao.trim()
      };

      console.log('[Cadastro Idoso] Enviando:', payload);

      const response = await criarAssistidoApi(payload);

      console.log('[Cadastro Idoso] Sucesso:', response);

      Alert.alert('Sucesso', 'Idoso cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('IdososCadastrados') }
      ]);

    } catch (error: any) {
      console.log('[Cadastro Idoso] Erro:', error);

      const msg =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Erro ao cadastrar idoso.';

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image source={require('../assets/cadastro.png')} style={styles.logo} />

          <Text style={styles.title}>Cadastro do Idoso</Text>
          <Text style={styles.subtitle}>Preencha os dados pessoais</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome Completo *"
            value={nome}
            onChangeText={setNome}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Data de Nascimento (DD/MM/AAAA) *"
            value={dataNascimento}
            onChangeText={(t) => setDataNascimento(formatarData(t))}
            maxLength={10}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Observações (opcional)"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone Principal *"
            value={telefone1}
            onChangeText={(t) => setTelefone1(formatarTelefone(t))}
            keyboardType="phone-pad"
            maxLength={15}
            placeholderTextColor="#666"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone Opcional"
            value={telefone2}
            onChangeText={(t) => setTelefone2(formatarTelefone(t))}
            keyboardType="phone-pad"
            maxLength={15}
            placeholderTextColor="#666"
          />

          <Text style={styles.obrigatorio}>* Campos obrigatórios</Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleConfirmar}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40,
    flexGrow: 1 
  },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 20 },
  title: {
    fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333'
  },
  subtitle: {
    fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    color: '#000',
    fontSize: 16
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top'
  },
  obrigatorio: {
    fontSize: 14, color: '#666', marginBottom: 10, fontStyle: 'italic'
  },
  button: {
    backgroundColor: '#3E8CE5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center', marginBottom: 15
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E'
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', marginTop: 10 },
  cancelButtonText: { color: '#3E8CE5', fontSize: 16, fontWeight: '600' }
});

export default Cadastro;