import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearAuth } from '../api/axios';

const USER_KEY = '@bioalert_user';

const Perfil = ({ navigation }: { navigation: any }) => {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const carregarUsuario = async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUsuario(parsed);
      } else {
        setUsuario(null);
      }
    } catch (error) {
      console.log('[Perfil] erro ao carregar usuario', error);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuario();
  }, []);

  const formatarData = (data: string) => {
    if (!data) return '-';
    try {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return data;
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          Nenhuma informação encontrada.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Fazer Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const inicial = usuario?.nome_completo
    ? usuario.nome_completo[0].toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* AVATAR CINZA */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{inicial}</Text>
          </View>
          <Text style={styles.nome}>{usuario.nome_completo}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
        </View>

        {/* CARD DADOS */}
        <View style={styles.card}>
          <Text style={styles.label}>Nome Completo:</Text>
          <Text style={styles.value}>{usuario.nome_completo}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{usuario.email}</Text>

          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>
            {usuario.telefone ? usuario.telefone : '-'}
          </Text>

          <Text style={styles.label}>Data de Nascimento:</Text>
          <Text style={styles.value}>
            {formatarData(usuario.data_nascimento)}
          </Text>
        </View>

        {/* BOTÃO SAIR */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 20, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 30 },

  // AVATAR CINZA COM A INICIAL
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: '#666'
  },

  nome: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#777', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30
  },
  label: { fontSize: 14, color: '#777', marginTop: 10 },
  value: { fontSize: 16, fontWeight: '600', color: '#333' },

  logoutBtn: {
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  button: {
    backgroundColor: '#3E8CE5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: { color: '#fff', fontWeight: '700' }
});

export default Perfil;
