import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useAsyncStorage<T>(key: string, defaultValue: T | null = null) {
  const [storedValue, setStoredValue] = useState<T | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : defaultValue);
      } catch (error) {
        console.error("Error leyendo AsyncStorage", error);
      }
    };
    fetchData();
  }, [key, defaultValue]);

  const setValue = async (value: T) => {
    try {
      setStoredValue(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error escribiendo en AsyncStorage", error);
    }
  };

  const removeValue = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.error("Error eliminando de AsyncStorage", error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}
