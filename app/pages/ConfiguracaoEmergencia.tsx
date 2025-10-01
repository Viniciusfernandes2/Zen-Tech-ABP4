import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContatoEmergencia {
  id: number;
  nome: string;
  telefone: string;
}

const ConfiguracaoEmergencia = ({ navigation }: { navigation: any }) => {
  const [contatos, setContatos] = useState<ContatoEmergencia[]>([
    { id: 1, nome: '', telefone: '' },
  ]);

  const STORAGE_KEY = '@contatos_emergencia';

  useEffect(() => {
    carregarContatos();
  }, []);

  const carregarContatos = async () => {
    try {
      const contatosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
      if (contatosSalvos) {
        const contatosParseados = JSON.parse(contatosSalvos);
        setContatos(contatosParseados);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os contatos salvos.');
    }
  };

  const salvarContatos = async () => {
    try {
      const contatosPreenchidos = contatos.filter(contato => 
        contato.nome.trim() && contato.telefone.trim()
      );

      if (contatosPreenchidos.length === 0) {
        Alert.alert('Atenção', 'Adicione pelo menos um contato de emergência.');
        return;
      }

      for (const contato of contatosPreenchidos) {
        if (!validarTelefone(contato.telefone)) {
          Alert.alert('Erro', `Telefone "${contato.telefone}" não é válido. Use o formato (XX) XXXXX-XXXX`);
          return;
        }
      }

      const contatosParaSalvar = contatos.filter(contato => 
        contato.nome.trim() && contato.telefone.trim()
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contatosParaSalvar));
      
      Alert.alert('Sucesso', 'Contatos de emergência salvos com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os contatos.');
      console.error('Erro ao salvar contatos:', error);
    }
  };

  const validarTelefone = (telefone: string): boolean => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
  };

  const atualizarContato = (id: number, campo: keyof ContatoEmergencia, valor: string) => {
    setContatos(prevContatos =>
      prevContatos.map(contato =>
        contato.id === id ? { ...contato, [campo]: valor } : contato
      )
    );
  };

  const adicionarContato = () => {
    if (contatos.length >= 5) {
      Alert.alert('Atenção', 'Máximo de 5 contatos permitidos.');
      return;
    }

    const novoId = contatos.length > 0 ? Math.max(...contatos.map(c => c.id)) + 1 : 1;
    setContatos([...contatos, { id: novoId, nome: '', telefone: '' }]);
  };

  const removerContato = (id: number) => {
    if (contatos.length <= 1) {
      Alert.alert('Atenção', 'É necessário ter pelo menos um contato.');
      return;
    }

    setContatos(contatos.filter(contato => contato.id !== id));
  };

  const formatarTelefone = (texto: string): string => {
    const numeros = texto.replace(/\D/g, '');
    const numerosLimitados = numeros.slice(0, 11);
    
    if (numerosLimitados.length <= 10) {
      return numerosLimitados
        .replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    } else {
      return numerosLimitados
        .replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    }
  };

  const limparTodosContatos = async () => {
    Alert.alert(
      'Limpar Contatos',
      'Tem certeza que deseja limpar todos os contatos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setContatos([{ id: 1, nome: '', telefone: '' }]);
              Alert.alert('Sucesso', 'Todos os contatos foram removidos.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar os contatos.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Configuração de Emergência</Text>
        <Text style={styles.subtitle}>
          Configure os telefones que serão notificados em caso de queda
        </Text>

        <View style={styles.contatosContainer}>
          {contatos.map((contato, index) => (
            <View key={contato.id} style={styles.contatoCard}>
              <Text style={styles.contatoLabel}>Contato {index + 1}</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nome do contato"
                placeholderTextColor="#999"
                value={contato.nome}
                onChangeText={(text) => atualizarContato(contato.id, 'nome', text)}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Telefone (ex: (11) 98765-4321)"
                placeholderTextColor="#999"
                value={contato.telefone}
                onChangeText={(text) => {
                  const formatted = formatarTelefone(text);
                  atualizarContato(contato.id, 'telefone', formatted);
                }}
                keyboardType="phone-pad"
                maxLength={15}
              />
              
              {contatos.length > 1 && (
                <TouchableOpacity
                  style={styles.removerButton}
                  onPress={() => removerContato(contato.id)}
                >
                  <Text style={styles.removerButtonText}>Remover Contato</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {contatos.length < 5 && (
          <TouchableOpacity style={styles.adicionarButton} onPress={adicionarContato}>
            <Text style={styles.adicionarButtonText}>+ Adicionar Contato</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Os contatos salvos receberão SMS automático com sua localização em caso de emergência.
          </Text>
          <Text style={styles.infoText}>
            📱 Formato: (DDD) + número (ex: (11) 98765-4321)
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.limparButton} 
            onPress={limparTodosContatos}
          >
            <Text style={styles.limparButtonText}>Limpar Tudo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelarButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelarButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.salvarButton} onPress={salvarContatos}>
            <Text style={styles.salvarButtonText}>Salvar Contatos</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  contatosContainer: {
    marginBottom: 20,
  },
  contatoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contatoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  removerButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  removerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  adicionarButton: {
    backgroundColor: '#3E8CE5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adicionarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  limparButton: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  limparButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelarButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelarButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  salvarButton: {
    backgroundColor: '#5fcf80',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salvarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfiguracaoEmergencia;