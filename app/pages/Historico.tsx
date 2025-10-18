import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  SafeAreaView 
} from 'react-native';

const Historico = () => {
  const quedas = [
    { id: '1', data: '15/03/2024', horario: '14:30' },
    { id: '2', data: '10/03/2024', horario: '09:15' },
    { id: '3', data: '05/03/2024', horario: '16:45' },
  ];

  const formatarData = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${dia}/${mes}/${ano.slice(2)}`;
  };

  // Componente para renderizar cada linha da tabela
  const TableRow = ({ queda, index }: { queda: any; index: number }) => (
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Histórico de Quedas</Text>
          <Text style={styles.subtitle}>
            Registro completo de todas as quedas detectadas
          </Text>
        </View>

        <View style={styles.tableContainer}>
          <TableHeader />
          
          <ScrollView 
            style={styles.tableBody}
            showsVerticalScrollIndicator={false}
          >
            {quedas.length > 0 ? (
              quedas.map((queda, index) => (
                <TableRow key={queda.id} queda={queda} index={index} />
              ))
            ) : (
              <EmptyState />
            )}
          </ScrollView>

          <TableFooter />
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendText}>
            💡 As quedas são detectadas automaticamente pela pulseira e 
            registradas com data e hora exatas.
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
    marginBottom: 30,
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
    paddingHorizontal: 15,
  },
  headerCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 15,
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
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  horarioCell: {
    flex: 1,
    fontSize: 15,
    color: '#666',
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
  },
});

export default Historico;