import SplashScreen from "@/components/SplashScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { login, loginWithFirebase, user, token, ready } = useAuth();

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && token) {
      router.replace("/(main)/home");
    }
  }, [user, token, router]);

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingresa un correo válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleGoogleLogin = async () => {
    const { data, type } = await GoogleSignin.signIn();
    if (type !== "success") {
      Alert.alert("Error", "No se pudo iniciar sesión con Google");
      return;
    }
    if (!data) {
      Alert.alert("Error", "No se pudo obtener la información de Google");
    } else {
      setIsLoading(true);
      try {
        await loginWithFirebase(data.idToken ?? "");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al iniciar sesión. Verifica tus credenciales.";

        setErrors({ general: errorMessage });

        Alert.alert("Error de inicio de sesión", errorMessage, [
          { text: "Entendido", style: "default" },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEmailLogin = useCallback(async () => {
    if (isLoading) return;

    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión. Verifica tus credenciales.";

      setErrors({ general: errorMessage });

      Alert.alert("Error de inicio de sesión", errorMessage, [
        { text: "Entendido", style: "default" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isLoading, login, validateForm]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  if (!ready) {
    return <SplashScreen />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header con logo */}
          <View className="items-center mt-8 mb-12">
            <View className="mb-6">
              <Image
                source={require("@/assets/images/icon.png")}
                className="w-24 h-24 rounded-lg"
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              Bienvenido de nuevo
            </Text>
            <Text className="text-muted-foreground text-center mt-2 max-w-sm">
              Inicia sesión en tu cuenta para continuar
            </Text>
          </View>

          {/* Formulario */}
          <View className="gap-6">
            {/* Error general */}
            {errors.general && (
              <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <Text className="text-destructive text-sm text-center">
                  {errors.general}
                </Text>
              </View>
            )}

            {/* Campo de email */}
            <View className="gap-2">
              <Label className="text-sm font-medium text-foreground">
                Correo electrónico
              </Label>
              <Input
                placeholder="tu@ejemplo.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <Text className="text-destructive text-xs mt-1">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Campo de contraseña */}
            <View className="gap-2">
              <Label className="text-sm font-medium text-foreground">
                Contraseña
              </Label>
              <View className="relative">
                <Input
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                  className={
                    errors.password ? "border-destructive pr-12" : "pr-12"
                  }
                />
                <Pressable
                  onPress={togglePasswordVisibility}
                  className="absolute right-3 top-3 p-1"
                  accessibilityLabel={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    className="text-muted-foreground"
                  />
                </Pressable>
              </View>
              {errors.password && (
                <Text className="text-destructive text-xs mt-1">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Botón de login */}
            <Button
              onPress={handleEmailLogin}
              disabled={isLoading}
              className="w-full rounded-xl h-12 mt-8"
              size="lg"
            >
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-base font-medium">
                    Iniciando sesión...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-base font-medium">
                  Iniciar sesión
                </Text>
              )}
            </Button>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-border" />
              <Text className="px-4 text-muted-foreground text-sm">
                O continúa con
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Botón de Google */}
            <Pressable
              onPress={handleGoogleLogin}
              className="w-full h-12 flex-row items-center justify-center border border-border rounded-xl bg-card active:bg-accent"
              accessibilityLabel="Iniciar sesión con Google"
            >
              <AntDesign
                name="google"
                size={20}
                className="text-foreground mr-3"
              />
              <Text className="text-foreground text-base font-medium">
                Continuar con Google
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
