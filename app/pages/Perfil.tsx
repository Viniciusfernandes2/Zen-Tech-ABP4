import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Perfil = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState({
    nome: 'João Silva',
    dataNascimento: '15/03/1950',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    telefone1: '(11) 99999-9999',
    telefone2: '(11) 88888-8888',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Meu Perfil</Text>
        
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <Text style={styles.userName}>{userData.nome}</Text>
          <Text style={styles.userAge}>73 anos</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={userData.nome}
              onChangeText={(text) => setUserData({...userData, nome: text})}
              editable={isEditing}
              placeholder="Nome completo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              value={userData.dataNascimento}
              onChangeText={(text) => setUserData({...userData, dataNascimento: text})}
              editable={isEditing}
              placeholder="DD/MM/AAAA"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={userData.endereco}
              onChangeText={(text) => setUserData({...userData, endereco: text})}
              editable={isEditing}
              multiline
              numberOfLines={3}
              placeholder="Endereço completo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone Principal</Text>
            <TextInput
              style={styles.input}
              value={userData.telefone1}
              onChangeText={(text) => setUserData({...userData, telefone1: text})}
              editable={isEditing}
              placeholder="(00) 00000-0000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone Secundário</Text>
            <TextInput
              style={styles.input}
              value={userData.telefone2}
              onChangeText={(text) => setUserData({...userData, telefone2: text})}
              editable={isEditing}
              placeholder="(00) 00000-0000"
            />
          </View>
        </View>

        {isEditing ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEdit}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Informações do Cuidador</Text>
          <Text style={styles.infoText}>📞 Maria Silva - (11) 77777-7777</Text>
          <Text style={styles.infoText}>👥 Filha</Text>
          <TouchableOpacity 
            style={styles.cuidadorButton}
            onPress={() => navigation.navigate('CadastroCuidador')}
          >
            <Text style={styles.cuidadorButtonText}>Editar Cuidador</Text>
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3E8CE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userAge: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#3E8CE5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#5fcf80',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 5,
    lineHeight: 22,
  },
  cuidadorButton: {
    backgroundColor: '#2196f3',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  cuidadorButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Perfil;