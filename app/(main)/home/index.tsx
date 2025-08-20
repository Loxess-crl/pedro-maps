import { Button } from "@/components/ui/button";
import ChipGroup from "@/components/ui/chipgroup";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const greetText =
    new Date().getHours() < 12 ? "Buenos días" : "Buenas tardes";
  const router = useRouter();
  const { user, token, ready, logout } = useAuth();

  useEffect(() => {
    if (!user && !token) {
      router.replace("/(auth)/login");
    }
  }, [user, token, ready, router]);

  return (
    <View className="flex-1 bg-background/20 pt-10">
      <View className="border-b border-[#d1d1d1] w-full py-8 px-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-4xl font-bold">{greetText},</Text>
            <Text className="text-4xl font-bold">{user?.name} 👋</Text>
          </View>
          <View className="font-normal">
            <View className="flex-1 justify-center items-center p-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <FontAwesome6 name="user-circle" size={24} color="#333" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side={"bottom"}
                  insets={{
                    top: insets.top,
                    bottom: insets.bottom,
                    left: 12,
                    right: 12,
                  }}
                  className="w-80"
                >
                  <Text className="font-medium leading-none native:text-xl">
                    {user?.name} {user?.ln_pat}
                  </Text>
                  <Button
                    variant="destructive"
                    className="mt-2"
                    onPress={logout}
                  >
                    <Text className="text-white">Cerrar Sesión</Text>
                  </Button>
                </PopoverContent>
              </Popover>
            </View>
          </View>
        </View>

        <View className="rounded-3xl relative mt-8 w-full">
          <Image
            source={require("@/assets/images/banner_home.jpeg")}
            alt="Home"
            className="w-full h-32 rounded-3xl"
          />
          <View className="absolute inset-0 p-4 rounded-b-3xl">
            <Text className="text-2xl font-bold text-white">
              Bienvenido a Pedro Maps
            </Text>
            <Text className="text-lg text-white font-semibold">
              Consulta la ubicación de los buses de la universidad
            </Text>
          </View>
        </View>
      </View>
      <View className="p-4">
        <Text className="text-xl font-semibold">
          Selecciona la dirección de los buses
        </Text>
        <View className="mt-4 mb-6">
          <ChipGroup
            options={[
              { label: "Chiclayo a Lambayeque", value: "opt1" },
              { label: "Lambayeque a Chiclayo", value: "opt2" },
            ]}
            onChange={(value) => console.log("Seleccionado:", value)}
            defaultValue="opt1"
          />
        </View>
        <View className="h-[400px] w-full rounded-2xl overflow-hidden">
          <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            showsUserLocation
          />
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
