import * as SecureStore from "expo-secure-store";

class SecureStoreService {
  private static TOKEN_KEY = "pedroMapsAuthToken";

  static async saveToken(token: string) {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
    } catch (error) {
      console.error("Error guardando el token", error);
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error obteniendo el token", error);
      return null;
    }
  }

  static async removeToken() {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error eliminando el token", error);
    }
  }
}

export default SecureStoreService;
