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

  useFocusEffect(
    useCallback(() => {
      carregarIdosos();
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
      const [dia, mes, ano] = dataNascimento.split('/');
      const nascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
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
        <Text style={styles.headerTitle}>Idosos Cadastrados</Text>
        <Text style={styles.headerSub}>Selecione ou vincule idosos ao seu perfil.</Text>

        {/* BOTÃO PARA VINCULAR POR CÓDIGO */}
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.linkBtnText}>Você já tem um idoso cadastrado? Vincular por código</Text>
        </TouchableOpacity>

        {/* LISTA */}
        {idosos.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhum idoso encontrado</Text>
            <Text style={styles.emptySub}>
              Adicione um novo idoso ou vincule-se usando o código.
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('Cadastro')}
            >
              <Text style={styles.addBtnText}>Cadastrar novo idoso</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {idosos.map((idoso) => (
              <TouchableOpacity
                key={idoso.id}
                style={styles.card}
                onPress={() => selecionarIdoso(idoso)}
              >
                <Text style={styles.cardName}>{idoso.nome_completo}</Text>

                {idoso.data_nascimento && (
                  <Text style={styles.cardAge}>
                    {calcularIdade(idoso.data_nascimento)} anos
                  </Text>
                )}

                {idoso.codigo_compartilhamento && (
                  <Text style={styles.cardCode}>
                    Código: {idoso.codigo_compartilhamento}
                  </Text>
                )}

                <Text style={styles.cardInfo}>{idoso.telefone_1 || '—'}</Text>
              </TouchableOpacity>
            ))}

            {/* BOTÃO FLUTUANTE */}
            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={() => navigation.navigate('Cadastro')}
            >
              <Text style={styles.floatingText}>+</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  headerSub: { fontSize: 15, color: '#666', marginBottom: 20 },

  linkBtn: {
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3E8CE5',
  },
  linkBtnText: { color: '#1976D2', fontSize: 15, fontWeight: '600' },

  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardName: { fontSize: 20, fontWeight: '700', color: '#333' },
  cardAge: { fontSize: 14, color: '#777', marginTop: 4 },
  cardInfo: { fontSize: 14, color: '#555', marginTop: 7 },
  cardCode: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#3E8CE5' },

  emptyBox: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  emptySub: { textAlign: 'center', fontSize: 15, color: '#666', marginBottom: 20 },
  addBtn: {
    backgroundColor: '#3E8CE5',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 10,
  },
  addBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

  floatingBtn: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3E8CE5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  floatingText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, color: '#666' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 14,
    elevation: 6,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  modalSubtitle: { fontSize: 15, color: '#777', marginBottom: 20 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: '#3E8CE5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalCancelBtn: { marginTop: 14, alignItems: 'center' },
  modalCancelText: { color: '#777', fontSize: 15 },
});

export default IdososCadastrados;
