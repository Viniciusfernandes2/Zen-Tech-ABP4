import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Idoso {
  id: string;
  nome: string;
  dataNascimento: string;
  endereco: string;
  telefone1: string;
  telefone2?: string;
  observacao?: string;
  dataCadastro?: string;
}

const IdososCadastrados = ({ navigation }: { navigation: any }) => {
  const [idosos, setIdosos] = useState<Idoso[]>([]);
  const [nomeCuidador, setNomeCuidador] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    await Promise.all([carregarIdosos(), carregarNomeCuidador()]);
    setLoading(false);
  };

  const carregarIdosos = async () => {
    try {
      const idososSalvos = await AsyncStorage.getItem('@idosos_cadastrados');
      console.log('Idosos carregados do AsyncStorage:', idososSalvos);
      
      if (idososSalvos) {
        const idososParseados = JSON.parse(idososSalvos);
        setIdosos(Array.isArray(idososParseados) ? idososParseados : []);
      } else {
        setIdosos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar idosos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de idosos');
      setIdosos([]);
    }
  };

  const carregarNomeCuidador = async () => {
    try {
      const cuidadorSalvo = await AsyncStorage.getItem('@cuidador_data');
      console.log('Dados do cuidador salvos:', cuidadorSalvo);
      
      if (cuidadorSalvo) {
        const cuidador = JSON.parse(cuidadorSalvo);
        console.log('Cuidador parseado:', cuidador);
        
        if (cuidador.nome_completo) {
          const primeiroNome = cuidador.nome_completo.split(' ')[0];
          setNomeCuidador(primeiroNome);
        } else if (cuidador.nome) {
          const primeiroNome = cuidador.nome.split(' ')[0];
          setNomeCuidador(primeiroNome);
        } else {
          console.warn('Campo nome não encontrado no cuidador');
          setNomeCuidador('Cuidador');
        }
      } else {
        console.log('Nenhum cuidador encontrado no AsyncStorage');
        setNomeCuidador('Cuidador');
      }
    } catch (error) {
      console.error('Erro ao carregar nome do cuidador:', error);
      setNomeCuidador('Cuidador');
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    try {
      const [dia, mes, ano] = dataNascimento.split('/');
      const nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mesAtual = hoje.getMonth();
      const diaAtual = hoje.getDate();
      
      if (mesAtual < nascimento.getMonth() || 
          (mesAtual === nascimento.getMonth() && diaAtual < nascimento.getDate())) {
        idade--;
      }
      
      return idade;
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return 0;
    }
  };

  const selecionarIdoso = (idoso: Idoso) => {
    console.log('Idoso selecionado:', idoso);
    navigation.navigate('Menu', { 
      idosoSelecionado: idoso 
    });
  };

  const adicionarIdoso = () => {
    navigation.navigate('Cadastro');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const editarIdoso = (idoso: Idoso, index: number) => {
    Alert.alert(
      'Editar Idoso',
      `O que deseja fazer com ${idoso.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Editar', 
          onPress: () => navigation.navigate('Cadastro', { idosoParaEditar: idoso })
        },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => removerIdoso(index)
        }
      ]
    );
  };

  const removerIdoso = async (index: number) => {
    const idoso = idosos[index];
    
    Alert.alert(
      'Remover Idoso',
      `Tem certeza que deseja remover ${idoso.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              const novosIdosos = idosos.filter((_, i) => i !== index);
              await AsyncStorage.setItem('@idosos_cadastrados', JSON.stringify(novosIdosos));
              setIdosos(novosIdosos);
              Alert.alert('Sucesso', 'Idoso removido com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o idoso');
            }
          }
        }
      ]
    );
  };

  // Função para limpar dados (apenas para desenvolvimento)
  const limparDados = async () => {
    Alert.alert(
      'Limpar Dados',
      'Deseja limpar todos os dados? (Apenas para desenvolvimento)',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@idosos_cadastrados');
              await AsyncStorage.removeItem('@cuidador_data');
              await AsyncStorage.removeItem('@user_logged_in');
              await AsyncStorage.removeItem('@current_user');
              setIdosos([]);
              setNomeCuidador('Cuidador');
              Alert.alert('Sucesso', 'Dados limpos com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao limpar dados');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3E8CE5" />
          <Text style={styles.loadingText}>Carregando idosos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3E8CE5']}
            tintColor="#3E8CE5"
          />
        }
      >
        {/* Header com saudação */}
        <View style={styles.header}>
          <Text style={styles.saudacao}>Olá, {nomeCuidador}</Text>
          <Text style={styles.subtitle}>
            Selecione um idoso para monitorar
          </Text>
        </View>

        {idosos.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>Nenhum idoso cadastrado</Text>
              <Text style={styles.emptyStateSubtitle}>
                Adicione um idoso para começar o monitoramento
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={adicionarIdoso}
              >
                <Text style={styles.emptyStateButtonText}>Adicionar Idoso</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.idososList}>
            <Text style={styles.listaTitle}>
              {idosos.length} {idosos.length === 1 ? 'Idoso Cadastrado' : 'Idosos Cadastrados'}
            </Text>
            
            {idosos.map((idoso, index) => (
              <TouchableOpacity
                key={idoso.id || `idoso-${index}`}
                style={styles.idosoCard}
                onPress={() => selecionarIdoso(idoso)}
                onLongPress={() => editarIdoso(idoso, index)}
                delayLongPress={500}
              >
                <View style={styles.idosoHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {idoso.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.idosoInfo}>
                    <Text style={styles.idosoNome}>{idoso.nome}</Text>
                    <Text style={styles.idosoIdade}>
                      {calcularIdade(idoso.dataNascimento)} anos
                    </Text>
                    <Text style={styles.idosoTelefone}>
                      {idoso.telefone1}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.idosoDetails}>
                  <Text style={styles.idosoEndereco} numberOfLines={1}>
                    {idoso.endereco}
                  </Text>
                </View>

                <View style={styles.idosoStatus}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Pulseira conectada</Text>
                </View>

                <Text style={styles.editHint}>
                  Pressione e segure para editar ou remover
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Botão flutuante de adicionar - Só aparece quando há idosos */}
      {idosos.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={adicionarIdoso}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 30,
    paddingTop: 10,
  },
  saudacao: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  emptyStateButton: {
    backgroundColor: '#3E8CE5',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  idososList: {
    marginBottom: 20,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  idosoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  idosoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3E8CE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  idosoInfo: {
    flex: 1,
  },
  idosoNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  idosoIdade: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  idosoTelefone: {
    fontSize: 14,
    color: '#888',
  },
  idosoDetails: {
    marginBottom: 12,
  },
  idosoEndereco: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  idosoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5fcf80',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  editHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3E8CE5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 0,
  },
});

export default IdososCadastrados;