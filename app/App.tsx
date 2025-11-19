// App.tsx
import 'react-native-gesture-handler';
import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image } from 'react-native';

import Home from './pages/Home';
import Home1 from './pages/Home1';
import Principal from './pages/Principal';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import CadastroCuidador from './pages/CadastroCuidador';
import Menu from './pages/Menu';
import Pulseira from './pages/Pulseira';
import Historico from './pages/Historico';
import Localizacao from './pages/Localizacao';
import BPM from './pages/BPM';
import Emergencia from './pages/Emergencia';
import ConfiguracaoEmergencia from './pages/ConfiguracaoEmergencia';
import Perfil from './pages/Perfil';
import IdososCadastrados from './pages/IdososCadastrados';

import { setNavigationRef } from '../app/api/axios';

const Stack = createStackNavigator();

export default function App() {
  // ⬇️ navigationRef usado pelo axios para redirecionar (quando token expira)
  const navRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    if (navRef.current) {
      setNavigationRef(navRef.current);
    }
  }, []);

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#3E8CE5', height: 120 },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerRight: () => (
            <Image
              source={require('./assets/pulseira-icon-sos.png')}
              style={{
                width: 60,
                height: 60,
                marginRight: 15,
              }}
            />
          ),
        }}
      >
        {/* ---------- ROTAS ---------- */}
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home1"
          component={Home1}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Principal"
          component={Principal}
          options={{ title: 'Bem-vindo' }}
        />

        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: 'Login' }}
        />

        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{ title: 'Cadastro do Usuário' }}
        />

        <Stack.Screen
          name="CadastroCuidador"
          component={CadastroCuidador}
          options={{ title: 'Cadastro do Cuidador' }}
        />

        <Stack.Screen
          name="IdososCadastrados"
          component={IdososCadastrados}
          options={{
            title: 'Idosos Cadastrados',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{
            headerShown: false,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="Pulseira"
          component={Pulseira}
          options={{ title: 'Status da Pulseira' }}
        />

        <Stack.Screen
          name="Historico"
          component={Historico}
          options={{ title: 'Histórico de Quedas' }}
        />

        <Stack.Screen
          name="Localizacao"
          component={Localizacao}
          options={{ title: 'Localização' }}
        />

        <Stack.Screen
          name="BPM"
          component={BPM}
          options={{ title: 'Batimentos Cardíacos' }}
        />

        <Stack.Screen
          name="Emergencia"
          component={Emergencia}
          options={{ title: 'Emergência' }}
        />

        <Stack.Screen
          name="ConfiguracaoEmergencia"
          component={ConfiguracaoEmergencia}
          options={{ title: 'Configuração de Emergência' }}
        />

        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{ title: 'Meu Perfil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
