// App.tsx (atualizado)
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './pages/Home';
import Home1 from './pages/Home1';
import Principal from './pages/Principal';
import Cadastro from './pages/Cadastro';
import Menu from './pages/Menu';
import Pulseira from './pages/Pulseira';
import Historico from './pages/Historico';
import Localizacao from './pages/Localizacao';
import BPM from './pages/BPM';
import Emergencia from './pages/Emergencia';
import ConfiguracaoEmergencia from './pages/ConfiguracaoEmergencia'; // Adicione esta linha

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#3EBCE5', height: 120 },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
        }}>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Home1" component={Home1} options={{ headerShown: false }} />
        <Stack.Screen name="Principal" component={Principal} />
        <Stack.Screen name="Cadastro" component={Cadastro} /> 
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="Pulseira" component={Pulseira} /> 
        <Stack.Screen name="Historico" component={Historico} />
        <Stack.Screen name="Localizacao" component={Localizacao} />
        <Stack.Screen name="BPM" component={BPM} />
        <Stack.Screen name="Emergencia" component={Emergencia} />
        <Stack.Screen 
          name="ConfiguracaoEmergencia" 
          component={ConfiguracaoEmergencia} 
          options={{ title: 'Configuração de Emergência' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}