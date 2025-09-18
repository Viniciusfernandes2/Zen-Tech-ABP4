import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Historico = () => {
  const quedas = [
    { data: '07/08/25', horario: '14:00' },
    // Adicione mais quedas conforme necessário
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Histórico</Text>
      <Text style={styles.subtitle}>Aqui estão os registros de queda</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Data</Text>
          <Text style={styles.tableHeader}>Horário</Text>
        </View>
        {quedas.map((queda, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{queda.data}</Text>
            <Text style={styles.tableCell}>{queda.horario}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2',
  },
  tableCell: {
    flex: 1,
    padding: 10,
  },
});

export default Historico;