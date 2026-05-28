import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from './types';

const TOKEN_KEY = 'oac_access_token';
const REFRESH_TOKEN_KEY = 'oac_refresh_token';
const USER_KEY = 'oac_user';
const STUDENT_ID_KEY = 'oac_student_id';

const isWeb = Platform.OS === 'web';

const setItem = async (key: string, value: string) => {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  } else {
    return SecureStore.getItemAsync(key);
  }
};

const deleteItem = async (key: string) => {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const secureStorage = {
  async saveToken(token: string) {
    await setItem(TOKEN_KEY, token);
  },
  async getToken(): Promise<string | null> {
    return getItem(TOKEN_KEY);
  },
  async removeToken() {
    await deleteItem(TOKEN_KEY);
  },
  async saveRefreshToken(token: string) {
    await setItem(REFRESH_TOKEN_KEY, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY);
  },
  async removeRefreshToken() {
    await deleteItem(REFRESH_TOKEN_KEY);
  },
  async saveUser(user: User) {
    await setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser(): Promise<User | null> {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      await deleteItem(USER_KEY);
      return null;
    }
  },
  async removeUser() {
    await deleteItem(USER_KEY);
  },
  async saveStudentId(id: string) {
    await setItem(STUDENT_ID_KEY, id);
  },
  async getStudentId(): Promise<string | null> {
    return getItem(STUDENT_ID_KEY);
  },
  async removeStudentId() {
    await deleteItem(STUDENT_ID_KEY);
  },
  async saveStudentMeta(classId: string, sectionId: string, sessionId: string) {
    await Promise.all([
      setItem('oac_class_id', classId),
      setItem('oac_section_id', sectionId),
      setItem('oac_session_id', sessionId),
    ]);
  },
  async getStudentMeta(): Promise<{ classId: string | null; sectionId: string | null; sessionId: string | null }> {
    const [classId, sectionId, sessionId] = await Promise.all([
      getItem('oac_class_id'),
      getItem('oac_section_id'),
      getItem('oac_session_id'),
    ]);
    return { classId, sectionId, sessionId };
  },
  async removeStudentMeta() {
    await Promise.all([
      deleteItem('oac_class_id'),
      deleteItem('oac_section_id'),
      deleteItem('oac_session_id'),
    ]);
  },
  async clearAll() {
    await Promise.all([
      deleteItem(TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
      deleteItem(USER_KEY),
      deleteItem(STUDENT_ID_KEY),
      deleteItem('oac_class_id'),
      deleteItem('oac_section_id'),
      deleteItem('oac_session_id'),
    ]);
  },
};
