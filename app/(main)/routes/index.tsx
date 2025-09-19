import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutes } from "@/hooks/useRoutes";
import { Route } from "@/interfaces/schedule.interface";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RouteCard: React.FC<{
  route: Route;
  onPress: () => void;
  index: number;
}> = ({ route, onPress, index }) => (
  <TouchableOpacity
    onPress={onPress}
    className="mb-4"
    style={{
      transform: [{ scale: 0.98 }],
      opacity: 0.9,
    }}
    activeOpacity={0.8}
  >
    <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
      <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2873b4] to-[#7bd2e6]" />

      <CardHeader className="p-5 pb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full bg-[#ffc300] mr-2" />
              <Text className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                RUTA UNIVERSITARIA
              </Text>
            </View>
            <Text className="text-slate-900 text-xl font-bold leading-6 mb-2">
              {route.name}
            </Text>
            <Text className="text-slate-600 text-sm leading-5 opacity-80">
              {route.description}
            </Text>
          </View>
          <View className="bg-primary rounded-2xl p-4 shadow-md">
            <MaterialIcons name="route" size={28} color="white" />
          </View>
        </View>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <View className="flex-row items-center justify-between bg-slate-50 rounded-xl p-4">
          <View className="flex-row items-center">
            <View className="bg-[#2873b4]/10 rounded-full p-2 mr-3">
              <Ionicons name="location" size={18} color="#2873b4" />
            </View>
            <View>
              <Text className="text-slate-700 text-sm font-medium">
                Campus Principal
              </Text>
              <Text className="text-slate-500 text-xs">
                Sistema de navegación
              </Text>
            </View>
          </View>
          <View className="bg-primary rounded-xl px-4 py-2 shadow-sm">
            <Text className="text-white text-sm font-semibold">Ver Ruta</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  </TouchableOpacity>
);

const LoadingState: React.FC = () => (
  <View className="px-5 py-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <Card
        key={index}
        className="bg-white border-0 shadow-lg rounded-2xl mb-4 overflow-hidden"
      >
        <View className="absolute top-0 left-0 right-0 h-1 bg-slate-200" />
        <CardHeader className="p-5 pb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Skeleton className="h-3 bg-slate-200 rounded-full mb-3 w-1/3" />
              <Skeleton className="h-6 bg-slate-200 rounded-lg mb-3 w-4/5" />
              <Skeleton className="h-4 bg-slate-200 rounded w-full" />
              <Skeleton className="h-4 bg-slate-200 rounded w-3/4 mt-2" />
            </View>
            <Skeleton className="h-16 w-16 bg-slate-200 rounded-2xl" />
          </View>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <View className="bg-slate-50 rounded-xl p-4">
            <Skeleton className="h-12 bg-slate-200 rounded-xl w-full" />
          </View>
        </CardContent>
      </Card>
    ))}
  </View>
);

const EmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <View className="flex-1 items-center justify-center px-8 py-16">
    <View className="bg-gradient-to-br from-[#7bd2e6]/20 to-[#2873b4]/20 rounded-3xl p-8 mb-8">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <MaterialIcons name="explore-off" size={64} color="#7bd2e6" />
      </View>
    </View>

    <Text className="text-slate-900 text-2xl font-bold text-center mb-3">
      ¡Aún no hay rutas!
    </Text>
    <Text className="text-slate-600 text-base text-center leading-6 mb-8 max-w-xs opacity-80">
      Las rutas universitarias aparecerán aquí cuando estén disponibles.
      Mantente conectado para las últimas actualizaciones.
    </Text>

    <TouchableOpacity
      onPress={onRefresh}
      className="bg-gradient-to-r from-[#2873b4] to-[#7bd2e6] rounded-2xl px-8 py-4 shadow-lg"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        <Ionicons name="refresh" size={20} color="white" />
        <Text className="text-white font-semibold text-base ml-2">
          Actualizar rutas
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

const ErrorState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <View className="flex-1 items-center justify-center px-8 py-16">
    <View className="bg-red-50 rounded-3xl p-8 mb-8">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
      </View>
    </View>

    <Text className="text-slate-900 text-2xl font-bold text-center mb-3">
      Ups, algo salió mal
    </Text>
    <Text className="text-slate-600 text-base text-center leading-6 mb-8 max-w-xs opacity-80">
      No pudimos cargar las rutas universitarias. Verifica tu conexión y vuelve
      a intentarlo.
    </Text>

    <TouchableOpacity
      onPress={onRefresh}
      className="border-2 border-red-200 bg-red-50 rounded-2xl px-8 py-4"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        <Ionicons name="refresh" size={20} color="#ef4444" />
        <Text className="text-red-600 font-semibold text-base ml-2">
          Reintentar
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

const RoutesScreen: React.FC = () => {
  const params = useMemo(() => ({ perPage: 100, search: "Chiclayo" }), []);
  const { data: routes, isLoading, error, refresh } = useRoutes(params);
  const router = useRouter();

  const handleRoutePress = (route: Route) => {
    router.push({
      pathname: "/(main)/routes/[id]",
      params: {
        id: String(route.id),
        name: route.name,
        description: route.description,
        points: JSON.stringify(route.points),
      },
    });
  };

  const handleRefresh = () => {
    refresh();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <StatusBar barStyle="light-content" backgroundColor="#2873b4" />
        <LinearGradient
          colors={["#2873b4", "#7bd2e6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-5"
        >
          <SafeAreaView>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-1">
                  Rutas Campus
                </Text>
                <Text className="text-white/80 text-base">
                  Sistema de navegación universitaria
                </Text>
              </View>
              <View className="bg-white/20 rounded-2xl p-3">
                <MaterialIcons name="school" size={32} color="white" />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <ScrollView className="flex-1 -mt-4">
          <View className="bg-white rounded-t-3xl pt-6 min-h-full">
            <LoadingState />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-50">
        <StatusBar barStyle="light-content" backgroundColor="#2873b4" />
        <LinearGradient
          colors={["#2873b4", "#7bd2e6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-5"
        >
          <SafeAreaView>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-1">
                  Rutas Campus
                </Text>
                <Text className="text-white/80 text-base">
                  Sistema de navegación universitaria
                </Text>
              </View>
              <View className="bg-white/20 rounded-2xl p-3">
                <MaterialIcons name="school" size={32} color="white" />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View className="flex-1 bg-white rounded-t-3xl -mt-4">
          <ErrorState onRefresh={handleRefresh} />
        </View>
      </View>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <View className="flex-1 bg-slate-50">
        <StatusBar barStyle="light-content" backgroundColor="#2873b4" />
        <LinearGradient
          colors={["#2873b4", "#7bd2e6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-5"
        >
          <SafeAreaView>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-1">
                  Rutas Campus
                </Text>
                <Text className="text-white/80 text-base">
                  Sistema de navegación universitaria
                </Text>
              </View>
              <View className="bg-white/20 rounded-2xl p-3">
                <MaterialIcons name="school" size={32} color="white" />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View className="flex-1 bg-white rounded-t-3xl -mt-4">
          <EmptyState onRefresh={handleRefresh} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#2873b4" />

      {/* Header con gradiente */}
      <LinearGradient
        colors={["#2873b4", "#7bd2e6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-8 px-5"
      >
        <SafeAreaView>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-1">
                Rutas Campus
              </Text>
              <Text className="text-white/80 text-base">
                Sistema de navegación universitaria
              </Text>
            </View>
            <View className="bg-white/20 rounded-2xl p-3">
              <MaterialIcons name="school" size={32} color="white" />
            </View>
          </View>

          {/* Stats Card */}
          <View className="bg-white/10 backdrop-blur rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-[#ffc300] rounded-full p-2 mr-3">
                <MaterialIcons name="route" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">
                  {routes.length}
                </Text>
                <Text className="text-white/70 text-sm">
                  {routes.length === 1
                    ? "Ruta disponible"
                    : "Rutas disponibles"}
                </Text>
              </View>
            </View>
            <View className="bg-white/20 rounded-xl px-3 py-1">
              <Text className="text-white text-xs font-semibold">ACTIVO</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1 -mt-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#2873b4"]}
            tintColor="#2873b4"
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl pt-6 min-h-full">
          <View className="px-5 mb-4">
            <Text className="text-slate-900 text-xl font-bold mb-2">
              Rutas Disponibles
            </Text>
            <Text className="text-slate-600 text-sm opacity-80">
              Selecciona una ruta para ver los detalles y comenzar la navegación
            </Text>
          </View>

          <View className="px-5">
            {routes.map((route, index) => (
              <RouteCard
                key={route.id}
                route={route}
                index={index}
                onPress={() => handleRoutePress(route)}
              />
            ))}
          </View>

          {/* Footer */}
          <View className="mt-8 pt-6 px-5 pb-8">
            <View className="bg-slate-50 rounded-2xl p-6 items-center">
              <View className="bg-[#ffc300]/10 rounded-full p-3 mb-4">
                <MaterialIcons name="update" size={24} color="#ffc300" />
              </View>
              <Text className="text-slate-700 font-semibold text-center mb-1">
                Actualizaciones automáticas
              </Text>
              <Text className="text-slate-500 text-sm text-center">
                Las rutas se actualizan en tiempo real para ofrecerte la mejor
                experiencia de navegación
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RoutesScreen;
