import { UserPayload } from "@/interfaces/user.interface";
import AsyncStorage from "@react-native-async-storage/async-storage";

class StorageService {
  private static USER_DATA_KEY = "userData";
  private static ONBOARDED_KEY = "pedroMapsOnboarded";

  static async saveUserData(user: UserPayload) {
    try {
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error guardando datos del usuario", error);
    }
  }

  static async getUserData(): Promise<UserPayload | null> {
    try {
      const data = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error obteniendo datos del usuario", error);
      return null;
    }
  }

  static async removeUserData() {
    try {
      await AsyncStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error("Error eliminando datos del usuario", error);
    }
  }

  static async completeOnboarding() {
    try {
      await AsyncStorage.setItem(this.ONBOARDED_KEY, "true");
    } catch (error) {
      console.error("Error completando el onboarding", error);
    }
  }

  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.ONBOARDED_KEY);

      return value !== null && value === "true";
    } catch (error) {
      console.error("Error obteniendo estado del onboarding", error);
      return false;
    }
  }

  static async clearStorage() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error limpiando el almacenamiento", error);
    }
  }
}

export default StorageService;
