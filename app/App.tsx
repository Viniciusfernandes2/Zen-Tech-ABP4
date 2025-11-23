// App.tsx
import 'react-native-gesture-handler';
import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image } from 'react-native';

import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import CadastroCuidador from './pages/CadastroCuidador';
import Home from './pages/Home';
import Home1 from './pages/Home1';
import Principal from './pages/Principal';
import IdososCadastrados from './pages/IdososCadastrados';
import Menu from './pages/Menu';
import Pulseira from './pages/Pulseira';
import Historico from './pages/Historico';
import Perfil from './pages/Perfil';

import { setNavigationRef } from './api/axios';

const Stack = createStackNavigator();

export default function App() {
  const navRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    if (navRef.current) {
      setNavigationRef(navRef.current);
    }
  }, []);

  return (
    <NavigationContainer>  
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { 
            backgroundColor: '#3E8CE5', 
            height: 120 
          },
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
        }}>
        
        {/* ----------------- HOME PRINCIPAL----------------- */}
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }} 
        />

        {/* ----------------- HOME CARREGAMENTO ----------------- */}
        <Stack.Screen 
          name="Home1" 
          component={Home1} 
          options={{ headerShown: false }} 
        />

          <Stack.Screen 
          name="Principal" 
          component={Principal} 
           options={{ headerShown: false }}
        />

        {/* ----------------- LOGIN / CADASTRO ----------------- */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
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

        {/* ----------------- IDOSOS ----------------- */}
        <Stack.Screen
          name="IdososCadastrados"
          component={IdososCadastrados}
          options={{
            title: 'Idosos Cadastrados',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />

        {/* ----------------- MENU ----------------- */}
        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        {/* ----------------- PULSEIRA ----------------- */}
        <Stack.Screen
          name="Pulseira"
          component={Pulseira}
          options={{ title: 'Pulseira' }}
        />

        {/* ----------------- HISTÓRICO ----------------- */}
        <Stack.Screen
          name="Historico"
          component={Historico}
          options={{ title: 'Histórico de Quedas' }}
        />

        {/* ----------------- PERFIL ----------------- */}
        <Stack.Screen
          name="Perfil"
          component={Perfil}
          options={{ title: 'Meu Perfil' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
