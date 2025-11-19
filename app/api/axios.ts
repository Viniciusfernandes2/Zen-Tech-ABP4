// src/api/axios.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';

/** Keys AsyncStorage */
export const TOKEN_KEY = '@bioalert_token';
export const USER_KEY = '@bioalert_user';

/** Base URL */
const baseURL = 'https://deploy-bioalert.onrender.com/api';

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Navigation ref (opcional)
 * Não é função – é apenas um objeto ou null.
 */
let navigationRef: NavigationContainerRef<any> | null = null;
export function setNavigationRef(ref: NavigationContainerRef<any>) {
  navigationRef = ref;
}

/** ---------------------------------------------------
 *    REQUEST INTERCEPTOR  (CORRIGIDO)
 * ---------------------------------------------------
 * O Axios v1 precisa que o tipo seja:
 *     InternalAxiosRequestConfig
 * e NÃO AxiosRequestConfig
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[api] falha ao ler token', e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/** ---------------------------------------------------
 *    RESPONSE INTERCEPTOR  (mantido, apenas seguro)
 * --------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    console.log('[api] response error', status, error?.message);

    if (status === 401) {
      // limpa token e user
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);

      try {
        Alert.alert('Sessão expirada', 'Faça login novamente.');
      } catch {}

      if (navigationRef?.isReady()) {
        navigationRef.navigate('Login' as never);
      }
    }

    return Promise.reject(error);
  }
);

/** Helpers de token */
export async function saveAuthToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function saveUserProfile(userJson: string) {
  await AsyncStorage.setItem(USER_KEY, userJson);
}

export async function clearAuth() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getAuthToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export default api;
