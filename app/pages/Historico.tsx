// Historico.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Importação corrigida
import { getHistoricoQuedas, Queda } from '../services/historicoService';

const Historico = () => {
  const [quedas, setQuedas] = useState<Queda[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarHistorico = async () => {
    try {
      const dados = await getHistoricoQuedas();
      setQuedas(dados);
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao carregar histórico de quedas');
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarHistorico();
    setRefreshing(false);
  };

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await carregarHistorico();
      setLoading(false);
    };

    inicializar();

    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarHistorico, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatarData = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${dia}/${mes}/${ano.slice(2)}`;
  };

  // Componente para renderizar cada linha da tabela
  const TableRow = ({ queda, index }: { queda: Queda; index: number }) => (
    <View 
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd
      ]}
    >
      <Text style={styles.dataCell}>
        {formatarData(queda.data)}
      </Text>
      <Text style={styles.horarioCell}>
        {queda.horario}
      </Text>
      <Text style={styles.aceleracaoCell}>
        {queda.total.toFixed(2)} m/s²
      </Text>
    </View>
  );

  // Componente para o estado de carregamento
  const LoadingState = () => (
    <View style={styles.emptyState}>
      <ActivityIndicator size="large" color="#3E8CE5" />
      <Text style={styles.emptyStateText}>Carregando histórico...</Text>
    </View>
  );

  // Componente para o estado vazio
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Nenhuma queda registrada
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Todas as quedas detectadas aparecerão aqui
      </Text>
    </View>
  );

  // Componente para o cabeçalho da tabela
  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerCell}>Data</Text>
      <Text style={styles.headerCell}>Horário</Text>
      <Text style={styles.headerCell}>Aceleração</Text>
    </View>
  );

  // Componente para o rodapé da tabela
  const TableFooter = () => (
    <View style={styles.tableFooter}>
      <Text style={styles.footerText}>
        Total de {quedas.length} queda{quedas.length !== 1 ? 's' : ''} registrada{quedas.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Histórico de Quedas</Text>
          <Text style={styles.subtitle}>
            Registro completo de todas as quedas detectadas
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{quedas.length}</Text>
            <Text style={styles.statLabel}>Total de Quedas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {quedas.length > 0 ? formatarData(quedas[0].data) : '--'}
            </Text>
            <Text style={styles.statLabel}>Última Queda</Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <TableHeader />
          
          <ScrollView 
            style={styles.tableBody}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <LoadingState />
            ) : quedas.length > 0 ? (
              quedas.map((queda, index) => (
                <TableRow key={queda.id} queda={queda} index={index} />
              ))
            ) : (
              <EmptyState />
            )}
          </ScrollView>

          {!loading && quedas.length > 0 && <TableFooter />}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendText}>
            💡 As quedas são detectadas automaticamente pela pulseira e 
            registradas com data e hora exatas.
          </Text>
          <Text style={styles.legendText}>
            📡 Dados atualizados automaticamente a cada 30 segundos.
          </Text>
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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
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
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E8CE5',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3E8CE5',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowEven: {
    backgroundColor: '#fafafa',
  },
  rowOdd: {
    backgroundColor: 'white',
  },
  dataCell: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  horarioCell: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  aceleracaoCell: {
    flex: 1,
    fontSize: 13,
    color: '#e74c3c',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  tableFooter: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  legend: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  legendText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
    marginBottom: 5,
  },
});

export default Historico;