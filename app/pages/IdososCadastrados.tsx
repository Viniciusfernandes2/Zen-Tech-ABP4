import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Idoso {
  id: string;
  nome: string;
  dataNascimento: string;
  endereco: string;
  telefone1: string;
  telefone2?: string;
}

const IdososCadastrados = ({ navigation }: { navigation: any }) => {
  const [idosos, setIdosos] = useState<Idoso[]>([]);
  const [nomeCuidador, setNomeCuidador] = useState('');

  useEffect(() => {
    carregarIdosos();
    carregarNomeCuidador();
  }, []);

  const carregarIdosos = async () => {
    try {
      const idososSalvos = await AsyncStorage.getItem('@idosos_cadastrados');
      if (idososSalvos) {
        setIdosos(JSON.parse(idososSalvos));
      }
    } catch (error) {
      console.error('Erro ao carregar idosos:', error);
    }
  };

  const carregarNomeCuidador = async () => {
    try {
      const cuidadorSalvo = await AsyncStorage.getItem('@cuidador_data');
      if (cuidadorSalvo) {
        const cuidador = JSON.parse(cuidadorSalvo);
        // Pegar apenas o primeiro nome (antes do primeiro espaço)
        const primeiroNome = cuidador.nome.split(' ')[0];
        setNomeCuidador(primeiroNome);
      }
    } catch (error) {
      console.error('Erro ao carregar nome do cuidador:', error);
    }
  };

  const calcularIdade = (dataNascimento: string) => {
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
  };

  const selecionarIdoso = (idoso: Idoso) => {
    navigation.navigate('Menu', { idosoSelecionado: idoso });
  };

  const adicionarIdoso = () => {
    navigation.navigate('Cadastro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header com saudação */}
        <View style={styles.header}>
          <Text style={styles.saudacao}>Olá, {nomeCuidador || 'Cuidador'}</Text>
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
            {idosos.map((idoso, index) => (
              <TouchableOpacity
                key={idoso.id}
                style={styles.idosoCard}
                onPress={() => selecionarIdoso(idoso)}
              >
                <View style={styles.idosoHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {idoso.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.idosoInfo}>
                    <Text style={styles.idosoNome}>{idoso.nome}</Text>
                    <Text style={styles.idosoIdade}>
                      {calcularIdade(idoso.dataNascimento)} anos
                    </Text>
                  </View>
                </View>
                <View style={styles.idosoStatus}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Pulseira conectada</Text>
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
});

export default IdososCadastrados;