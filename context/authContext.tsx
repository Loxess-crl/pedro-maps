import { UserPayload } from "@/interfaces/user.interface";
import { loginFirebase, login as userLogin } from "@/services/authService";
import SecureStoreService from "@/services/secureStoreService";
import storageService from "@/services/storageService";
import { useRouter } from "expo-router";
import React, { createContext, useEffect, useState } from "react";

interface AuthContextProps {
  user: UserPayload | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithFirebase: (token: string) => Promise<void>;
  logout: () => void;
  ready: boolean;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadStoredData = async () => {
      const storedToken = await SecureStoreService.getToken();
      const storedUser = await storageService.getUserData();
      setReady(true);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    };
    loadStoredData();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await userLogin(email, password);

    if (!response.data) {
      throw new Error("Credenciales inválidas");
    }

    const { token_data, user: newUser } = response.data;

    await SecureStoreService.saveToken(token_data.token);
    await storageService.saveUserData(newUser);

    setToken(token_data.token);
    setUser(newUser);

    router.replace("/(main)/home");
  };

  const loginWithFirebase = async (token: string) => {
    const response = await loginFirebase(token);

    if (!response.data) {
      throw new Error("Credenciales inválidas");
    }

    const { token_data, user: newUser } = response.data;

    await SecureStoreService.saveToken(token_data.token);
    await storageService.saveUserData(newUser);

    setToken(token_data.token);
    setUser(newUser);

    router.replace("/(main)/home");
  };

  const logout = async () => {
    await SecureStoreService.removeToken();
    await storageService.removeUserData();
    setToken(null);
    setUser(null);
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, loginWithFirebase, logout, ready }}
    >
      {children}
    </AuthContext.Provider>
  );
};
