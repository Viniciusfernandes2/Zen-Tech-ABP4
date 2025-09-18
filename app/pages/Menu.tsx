import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Menu = ({ navigation }: { navigation: any }) => {
  const menuOptions = [
    { title: 'Pulseira', screen: 'Pulseira' },
    { title: 'Meu Histórico', screen: 'Historico' },
    { title: 'Localização', screen: 'Localizacao' },
    { title: 'BPM', screen: 'BPM' },
    { title: 'Emergência', screen: 'Emergencia' },
  ];

  return (
    <View style={styles.container}>
      {menuOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => navigation.navigate(option.screen)}
        >
          <Text style={styles.optionText}>{option.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  option: {
    width: '100%',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#D8D8D8',
    borderRadius: 10,
    alignItems: 'center',
  },
  optionText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Menu;