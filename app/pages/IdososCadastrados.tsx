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
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { meusAssistidosApi } from '../services/assistidosService';
import { vincularPorCodigo } from '../services/vinculoService';
import { useFocusEffect } from '@react-navigation/native';

const ASSISTIDO_KEY = '@bioalert_assistido_selecionado';

interface Idoso {
  id: string;
  nome_completo: string;
  data_nascimento?: string;
  telefone_1?: string;
  codigo_compartilhamento?: string;
  observacoes?: string;
}

const IdososCadastrados = ({ navigation }: { navigation: any }) => {
  const [idosos, setIdosos] = useState<Idoso[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');
  const [nomeCuidador, setNomeCuidador] = useState('');

  const carregarIdosos = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await meusAssistidosApi();
      const lista = resp?.assistidos ?? resp ?? [];
      if (Array.isArray(lista)) {
        setIdosos(lista);
        await AsyncStorage.setItem('@idosos_cadastrados', JSON.stringify(lista));
      }
    } catch (error) {
      console.error('[IdososCadastrados] erro no backend', error);
      const local = await AsyncStorage.getItem('@idosos_cadastrados');
      setIdosos(local ? JSON.parse(local) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarNomeCuidador = async () => {
    try {
      const cuidadorSalvo = await AsyncStorage.getItem('@cuidador_data');
      if (cuidadorSalvo) {
        const cuidador = JSON.parse(cuidadorSalvo);
        const primeiroNome = cuidador.nome.split(' ')[0];
        setNomeCuidador(primeiroNome);
      }
    } catch (error) {
      console.error('Erro ao carregar nome do cuidador:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarIdosos();
      carregarNomeCuidador();
    }, [carregarIdosos])
  );

  const selecionarIdoso = async (idoso: Idoso) => {
    await AsyncStorage.setItem(ASSISTIDO_KEY, JSON.stringify(idoso));
    navigation.navigate('Menu', { assistido: idoso });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarIdosos();
    setRefreshing(false);
  };

  const calcularIdade = (dataNascimento: string) => {
    try {
      let nascimento: Date;
      
      // Verifica se a data está no formato AAAA-MM-DD (da API)
      if (dataNascimento.includes('-')) {
        const [ano, mes, dia] = dataNascimento.split('-');
        nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      } 
      // Verifica se está no formato DD/MM/AAAA (do cadastro local)
      else if (dataNascimento.includes('/')) {
        const [dia, mes, ano] = dataNascimento.split('/');
        nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      }
      // Se não for nenhum dos formatos conhecidos, retorna 0
      else {
        return 0;
      }

      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      
      // Ajusta a idade se ainda não fez aniversário este ano
      if (
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
      ) {
        idade--;
      }
      
      return idade;
    } catch {
      return 0;
    }
  };

  const handleVincular = async () => {
    if (!codigoInput.trim()) {
      Alert.alert('Erro', 'Digite um código válido.');
      return;
    }

    try {
      await vincularPorCodigo(codigoInput.trim());
      Alert.alert('Sucesso', 'Idoso vinculado com sucesso!');
      setModalVisible(false);
      setCodigoInput('');
      carregarIdosos();
    } catch (error: any) {
      const msg =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        'Não foi possível vincular. Verifique o código.';
      Alert.alert('Erro', msg);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#3E8CE5" />
          <Text style={styles.loadingText}>Carregando idosos…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL - VINCULAR POR CÓDIGO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Vincular por Código</Text>
            <Text style={styles.modalSubtitle}>
              Insira o código fornecido por outro cuidador.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Digite o código"
              value={codigoInput}
              onChangeText={setCodigoInput}
              autoCapitalize="characters"
            />

            <TouchableOpacity style={styles.modalBtn} onPress={handleVincular}>
              <Text style={styles.modalBtnText}>Vincular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3E8CE5']} />
        }
      >
        {/* Header com saudação */}
        <View style={styles.header}>
          <Text style={styles.saudacao}>Olá, {nomeCuidador || 'Cuidador'}</Text>
          <Text style={styles.subtitle}>
            Selecione um idoso para monitorar
          </Text>
        </View>

        {/* Botão para vincular por código */}
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.linkBtnText}>Você já tem um idoso cadastrado? Vincular por código</Text>
        </TouchableOpacity>

        {idosos.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>Nenhum idoso cadastrado</Text>
              <Text style={styles.emptyStateSubtitle}>
                Adicione um idoso para começar o monitoramento
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('Cadastro')}
              >
                <Text style={styles.emptyStateButtonText}>Adicionar Idoso</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.idososList}>
            {idosos.map((idoso) => (
              <TouchableOpacity
                key={idoso.id}
                style={styles.idosoCard}
                onPress={() => selecionarIdoso(idoso)}
              >
                <View style={styles.idosoHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {idoso.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.idosoInfo}>
                    <Text style={styles.idosoNome}>{idoso.nome_completo}</Text>
                    {idoso.data_nascimento && (
                      <Text style={styles.idosoIdade}>
                        {calcularIdade(idoso.data_nascimento)} anos
                      </Text>
                    )}
                    {idoso.codigo_compartilhamento && (
                      <Text style={styles.cardCode}>
                        Código: {idoso.codigo_compartilhamento}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Botão flutuante de adicionar - Só aparece quando há idosos */}
      {idosos.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => navigation.navigate('Cadastro')}
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
    marginBottom: 15,
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
  linkBtn: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3E8CE5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  linkBtnText: {
    color: '#1976D2',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardCode: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#3E8CE5',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalBtn: {
    backgroundColor: '#3E8CE5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  modalCancelBtn: {
    alignItems: 'center',
    padding: 10,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 15,
  },
});

export default IdososCadastrados;