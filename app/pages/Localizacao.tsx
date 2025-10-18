import React, { useState, useEffect, useRef } from 'react'; 
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Verifica se está no ambiente web
const isWeb = Platform.OS === 'web';

// Componente de mapa condicional
let MapComponent: any = null;
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (!isWeb) {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    
    MapComponent = ({ region, mapType, showsUserLocation, style, children, ref }: any) => (
      <MapView
        ref={ref}
        provider={PROVIDER_GOOGLE}
        style={style}
        region={region}
        showsUserLocation={showsUserLocation}
        mapType={mapType}
        showsBuildings={true}
        showsTraffic={false}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
      >
        {children}
      </MapView>
    );
  } catch (error) {
    console.warn('React Native Maps não está disponível:', error);
  }
}

const { width, height } = Dimensions.get('window');

// Coordenadas padrão (exemplo: São Paulo)
const DEFAULT_LATITUDE = -23.5505;
const DEFAULT_LONGITUDE = -46.6333;

const Localizacao = () => {
  const [localizacaoAtiva, setLocalizacaoAtiva] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('--:--');
  const [carregando, setCarregando] = useState(false);
  const [tipoMapa, setTipoMapa] = useState<any>(isWeb ? 'padrao' : 'standard');
  const [regiao, setRegiao] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState({ 
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });

  const mapRef = useRef<any>(null);

  const simularLocalizacaoReal = () => {
    // Simula pequenas variações na localização (como se o usuário estivesse se movendo)
    const variacao = 0.001;
    return {
      latitude: DEFAULT_LATITUDE + (Math.random() * variacao * 2 - variacao),
      longitude: DEFAULT_LONGITUDE + (Math.random() * variacao * 2 - variacao),
    };
  };

  const ativarLocalizacao = async () => {
    setCarregando(true);
    
    // Simula o tempo de carregamento para obter a localização
    setTimeout(() => {
      const novaLocalizacao = simularLocalizacaoReal();
      
      setLocalizacaoAtiva(true);
      setLocalizacaoUsuario(novaLocalizacao);
      setRegiao({
        ...novaLocalizacao,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      setCarregando(false);
      
      Alert.alert('Sucesso', 'Localização ativada com sucesso!');
    }, 2000);
  };

  const desativarLocalizacao = () => {
    setLocalizacaoAtiva(false);
    Alert.alert('Localização Desativada', 'O monitoramento de localização foi pausado.');
  };

  const atualizarLocalizacao = () => {
    if (localizacaoAtiva) {
      const novaLocalizacao = simularLocalizacaoReal();
      setLocalizacaoUsuario(novaLocalizacao);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      
      // Centraliza o mapa na nova localização (apenas mobile)
      if (!isWeb && mapRef.current) {
        mapRef.current.animateToRegion({
          ...novaLocalizacao,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      }
      
      Alert.alert('Localização Atualizada', 'Sua posição foi atualizada.');
    }
  };

  // Funções de controle do zoom (apenas mobile)
  const zoomIn = () => {
    if (!isWeb && mapRef.current) {
      mapRef.current.getCamera().then((camera: any) => {
        mapRef.current?.animateCamera({
          ...camera,
          zoom: camera.zoom ? camera.zoom + 1 : 16,
        }, { duration: 500 });
      });
    }
  };

  const zoomOut = () => {
    if (!isWeb && mapRef.current) {
      mapRef.current.getCamera().then((camera: any) => {
        mapRef.current?.animateCamera({
          ...camera,
          zoom: camera.zoom ? camera.zoom - 1 : 14,
        }, { duration: 500 });
      });
    }
  };

  const alternarTipoMapa = () => {
    if (isWeb) {
      const tipos = ['padrao', 'satelite', 'hibrido'];
      const currentIndex = tipos.indexOf(tipoMapa);
      const nextIndex = (currentIndex + 1) % tipos.length;
      setTipoMapa(tipos[nextIndex]);
    } else {
      setTipoMapa((prevTipo: any) => {
        switch (prevTipo) {
          case 'standard': return 'satellite';
          case 'satellite': return 'hybrid';
          case 'hybrid': return 'standard';
          default: return 'standard';
        }
      });
    }
  };

  const getTipoMapaTexto = () => {
    if (isWeb) {
      switch (tipoMapa) {
        case 'padrao': return 'Padrão';
        case 'satelite': return 'Satélite';
        case 'hibrido': return 'Híbrido';
        default: return 'Padrão';
      }
    } else {
      switch (tipoMapa) {
        case 'standard': return 'Padrão';
        case 'satellite': return 'Satélite';
        case 'hybrid': return 'Híbrido';
        default: return 'Padrão';
      }
    }
  };

  const centralizarNoUsuario = () => {
    if (localizacaoAtiva && !isWeb && mapRef.current) {
      mapRef.current.animateToRegion({
        ...localizacaoUsuario,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  // Componente de mapa para web
  const WebMapPlaceholder = () => (
    <View style={styles.webMapContainer}>
      <View style={styles.webMapContent}>
        <Text style={styles.webMapTitle}>🌍 Visualização do Mapa</Text>
        <Text style={styles.webMapText}>
          {localizacaoAtiva 
            ? `Sua localização atual: ${localizacaoUsuario.latitude.toFixed(6)}, ${localizacaoUsuario.longitude.toFixed(6)}`
            : 'Localização não disponível'
          }
        </Text>
        <Text style={styles.webMapSubtext}>
          Visualização completa disponível no aplicativo móvel
        </Text>
        <View style={styles.webMapCoordinates}>
          <Text style={styles.coordinatesTitle}>Coordenadas:</Text>
          <Text style={styles.coordinatesText}>
            Lat: {localizacaoUsuario.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            Long: {localizacaoUsuario.longitude.toFixed(6)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Localização</Text>
        <Text style={styles.subtitle}>Monitoramento em tempo real</Text>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            localizacaoAtiva ? styles.statusAtivo : styles.statusInativo
          ]}>
            <Text style={styles.statusText}>
              {localizacaoAtiva ? 'ATIVA' : 'INATIVA'}
            </Text>
          </View>
          <Text style={styles.statusMessage}>
            {localizacaoAtiva 
              ? 'Sua localização está sendo monitorada' 
              : 'Localização não está sendo monitorada'
            }
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>📍 Informações de Localização</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[
              styles.infoValue,
              localizacaoAtiva ? styles.infoValueAtivo : styles.infoValueInativo
            ]}>
              {localizacaoAtiva ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última atualização:</Text>
            <Text style={styles.infoValue}>{ultimaAtualizacao}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precisão:</Text>
            <Text style={styles.infoValue}>Alta</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coordenadas:</Text>
            <Text style={styles.coordenadasText}>
              {localizacaoAtiva 
                ? `${localizacaoUsuario.latitude.toFixed(6)}, ${localizacaoUsuario.longitude.toFixed(6)}`
                : '---, ---'
              }
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Visualização:</Text>
            <Text style={styles.infoValue}>{getTipoMapaTexto()}</Text>
          </View>
          {isWeb && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plataforma:</Text>
              <Text style={styles.infoValue}>Web</Text>
            </View>
          )}
        </View>

        {/* Mapa */}
        <View style={styles.mapaContainer}>
          {carregando ? (
            <View style={styles.carregandoContainer}>
              <ActivityIndicator size="large" color="#3E8CE5" />
              <Text style={styles.carregandoText}>Obtendo localização...</Text>
            </View>
          ) : (
            <>
              {isWeb ? (
                <WebMapPlaceholder />
              ) : MapComponent ? (
                <>
                  <MapComponent
                    ref={mapRef}
                    region={regiao}
                    mapType={tipoMapa}
                    showsUserLocation={false}
                    style={styles.mapa}
                  >
                    {localizacaoAtiva && (
                      <Marker
                        coordinate={localizacaoUsuario}
                        title="Sua Localização"
                        description="Você está aqui"
                        pinColor="#3E8CE5"
                      >
                        <View style={styles.marcadorPersonalizado}>
                          <View style={styles.marcadorPonto} />
                          <View style={styles.marcadorPulsante} />
                        </View>
                      </Marker>
                    )}
                  </MapComponent>

                  {/* Controles do Mapa (apenas mobile) */}
                  <View style={styles.controlesMapa}>
                    {/* Botão de centralização */}
                    {localizacaoAtiva && (
                      <TouchableOpacity 
                        style={[styles.controleButton, styles.centralizarButton]} 
                        onPress={centralizarNoUsuario}
                      >
                        <Text style={styles.controleIcon}>🎯</Text>
                      </TouchableOpacity>
                    )}

                    {/* Botões de Zoom */}
                    <View style={styles.zoomContainer}>
                      <TouchableOpacity 
                        style={[styles.controleButton, styles.zoomButton]} 
                        onPress={zoomIn}
                      >
                        <Text style={styles.controleIcon}>+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.controleButton, styles.zoomButton]} 
                        onPress={zoomOut}
                      >
                        <Text style={styles.controleIcon}>-</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Botão de tipo de mapa */}
                    <TouchableOpacity 
                      style={[styles.controleButton, styles.tipoMapaButton]} 
                      onPress={alternarTipoMapa}
                    >
                      <Text style={styles.controleIcon}>
                        {tipoMapa === 'standard' ? '🗺️' : 
                         tipoMapa === 'satellite' ? '🛰️' : '🌍'}
                      </Text>
                      <Text style={styles.tipoMapaTexto}>{getTipoMapaTexto()}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.carregandoContainer}>
                  <Text style={styles.carregandoText}>Mapa não disponível</Text>
                </View>
              )}
            </>
          )}
        </View>

        {localizacaoAtiva && (
          <TouchableOpacity 
            style={[styles.button, styles.atualizarButton]} 
            onPress={atualizarLocalizacao}
          >
            <Text style={styles.buttonText}>🔄 Atualizar Localização</Text>
          </TouchableOpacity>
        )}

        <View style={styles.botoesContainer}>
          {localizacaoAtiva ? (
            <TouchableOpacity 
              style={[styles.button, styles.desativarButton]} 
              onPress={desativarLocalizacao}
            >
              <Text style={styles.buttonText}>Desativar Localização</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.ativarButton]} 
              onPress={ativarLocalizacao}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Ativar Localização</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Como funciona:</Text>
          {!isWeb ? (
            <>
              <Text style={styles.instructionItem}>
                • <Text style={styles.instructionBold}>Zoom:</Text> Use os botões + e - ou gestos de pinça
              </Text>
              <Text style={styles.instructionItem}>
                • <Text style={styles.instructionBold}>Visualização:</Text> Alterne entre mapa padrão, satélite e híbrido
              </Text>
              <Text style={styles.instructionItem}>
                • <Text style={styles.instructionBold}>Centralizar:</Text> Clique no botão 🎯 para voltar à sua localização
              </Text>
            </>
          ) : (
            <Text style={styles.instructionItem}>
              • Use o aplicativo móvel para visualização completa do mapa
            </Text>
          )}
          <Text style={styles.instructionItem}>
            • A localização é compartilhada automaticamente em caso de queda
          </Text>
          <Text style={styles.instructionItem}>
            • Contatos de emergência recebem sua localização exata
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
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusAtivo: {
    backgroundColor: '#5fcf80',
  },
  statusInativo: {
    backgroundColor: '#ff6b6b',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoValueAtivo: {
    color: '#5fcf80',
  },
  infoValueInativo: {
    color: '#ff6b6b',
  },
  coordenadasText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  mapaContainer: {
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  mapa: {
    ...StyleSheet.absoluteFillObject,
  },
  webMapContainer: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMapContent: {
    alignItems: 'center',
  },
  webMapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  webMapText: {
    fontSize: 16,
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 5,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#64b5f6',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  webMapCoordinates: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bbdefb',
  },
  coordinatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  carregandoText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  marcadorPersonalizado: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcadorPonto: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3E8CE5',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  marcadorPulsante: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3E8CE5',
    opacity: 0.4,
    zIndex: -1,
  },
  controlesMapa: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'flex-end',
  },
  controleButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralizarButton: {
    width: 44,
    height: 44,
  },
  zoomContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 0,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tipoMapaButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  controleIcon: {
    fontSize: 18,
    textAlign: 'center',
  },
  tipoMapaTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  botoesContainer: {
    marginBottom: 15,
  },
  button: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ativarButton: {
    backgroundColor: '#3E8CE5',
  },
  desativarButton: {
    backgroundColor: '#ff6b6b',
  },
  atualizarButton: {
    backgroundColor: '#ffa726',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404',
  },
  instructionItem: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
    lineHeight: 20,
  },
  instructionBold: {
    fontWeight: 'bold',
  },
});

export default Localizacao;