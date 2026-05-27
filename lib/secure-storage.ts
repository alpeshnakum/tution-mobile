import * as SecureStore from 'expo-secure-store';

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
  async saveUser(user: object) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async getUser(): Promise<object | null> {
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
  async clearAll() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(STUDENT_ID_KEY),
    ]);
  },
};
