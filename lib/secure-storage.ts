import * as SecureStore from 'expo-secure-store';
import type { User } from './types';

const TOKEN_KEY = 'oac_access_token';
const USER_KEY = 'oac_user';
const STUDENT_ID_KEY = 'oac_student_id';

export const secureStorage = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  async saveUser(user: User) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async getUser(): Promise<User | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      await SecureStore.deleteItemAsync(USER_KEY);
      return null;
    }
  },
  async removeUser() {
    await SecureStore.deleteItemAsync(USER_KEY);
  },
  async saveStudentId(id: string) {
    await SecureStore.setItemAsync(STUDENT_ID_KEY, id);
  },
  async getStudentId(): Promise<string | null> {
    return SecureStore.getItemAsync(STUDENT_ID_KEY);
  },
  async removeStudentId() {
    await SecureStore.deleteItemAsync(STUDENT_ID_KEY);
  },
  async saveStudentMeta(classId: string, sectionId: string, sessionId: string) {
    await Promise.all([
      SecureStore.setItemAsync('oac_class_id', classId),
      SecureStore.setItemAsync('oac_section_id', sectionId),
      SecureStore.setItemAsync('oac_session_id', sessionId),
    ]);
  },
  async getStudentMeta(): Promise<{ classId: string | null; sectionId: string | null; sessionId: string | null }> {
    const [classId, sectionId, sessionId] = await Promise.all([
      SecureStore.getItemAsync('oac_class_id'),
      SecureStore.getItemAsync('oac_section_id'),
      SecureStore.getItemAsync('oac_session_id'),
    ]);
    return { classId, sectionId, sessionId };
  },
  async removeStudentMeta() {
    await Promise.all([
      SecureStore.deleteItemAsync('oac_class_id'),
      SecureStore.deleteItemAsync('oac_section_id'),
      SecureStore.deleteItemAsync('oac_session_id'),
    ]);
  },
  async clearAll() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(STUDENT_ID_KEY),
      SecureStore.deleteItemAsync('oac_class_id'),
      SecureStore.deleteItemAsync('oac_section_id'),
      SecureStore.deleteItemAsync('oac_session_id'),
    ]);
  },
};
