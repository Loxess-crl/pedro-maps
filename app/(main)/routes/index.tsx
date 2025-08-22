import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutes } from "@/hooks/useRoutes";
import { Route } from "@/interfaces/schedule.interface";
import { FontAwesome } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RouteCard: React.FC<{ route: Route; onPress: () => void }> = ({
  route,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} className="mb-4">
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <CardTitle className="text-slate-900 text-lg font-semibold leading-6">
              {route.name}
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm mt-1 leading-5">
              {route.description}
            </CardDescription>
          </View>
          <View className="bg-primary/10 rounded-full p-2">
            <FontAwesome name="map" size={20} className="text-primary" />
          </View>
        </View>
      </CardHeader>
      <CardContent className="pt-0">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FontAwesome
              name="map-pin"
              size={16}
              className="text-slate-500 mr-2"
            />
            <Text className="text-slate-600 text-sm">Ruta universitaria</Text>
          </View>
          <View className="bg-primary rounded-full px-3 py-1">
            <Text className="text-white text-xs font-medium">Ver ruta</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  </TouchableOpacity>
);

const LoadingState: React.FC = () => (
  <View className="px-4 py-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="bg-white border-slate-200 shadow-sm mb-4">
        <CardHeader className="pb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Skeleton className="h-5 bg-slate-200 rounded mb-2 w-3/4" />
              <Skeleton className="h-4 bg-slate-200 rounded w-full" />
              <Skeleton className="h-4 bg-slate-200 rounded w-5/6 mt-1" />
            </View>
            <Skeleton className="h-12 w-12 bg-slate-200 rounded-full" />
          </View>
        </CardHeader>
        <CardContent className="pt-0">
          <View className="flex-row items-center justify-between">
            <Skeleton className="h-4 bg-slate-200 rounded w-1/3" />
            <Skeleton className="h-6 bg-slate-200 rounded-full w-20" />
          </View>
        </CardContent>
      </Card>
    ))}
  </View>
);

const EmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <View className="flex-1 items-center justify-center px-6 py-12">
    <View className="bg-slate-100 rounded-full p-6 mb-6">
      <FontAwesome name="compass" size={48} className="text-slate-400" />
    </View>
    <Text className="text-slate-900 text-xl font-semibold text-center mb-2">
      No hay rutas disponibles
    </Text>
    <Text className="text-slate-600 text-base text-center leading-6 mb-8 max-w-sm">
      Actualmente no se han encontrado rutas universitarias. Intenta refrescar
      para ver las rutas más recientes.
    </Text>
    <Button onPress={onRefresh} className="bg-primary">
      <View className="flex-row items-center">
        <FontAwesome name="refresh" size={16} className="text-white mr-2" />
        <Text className="text-white font-medium">Refrescar rutas</Text>
      </View>
    </Button>
  </View>
);

const ErrorState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <View className="flex-1 items-center justify-center px-6 py-12">
    <View className="bg-red-100 rounded-full p-6 mb-6">
      <FontAwesome
        name="exclamation-circle"
        size={48}
        className="text-red-500"
      />
    </View>
    <Text className="text-slate-900 text-xl font-semibold text-center mb-2">
      Error al cargar rutas
    </Text>
    <Text className="text-slate-600 text-base text-center leading-6 mb-8 max-w-sm">
      Ha ocurrido un problema al cargar las rutas universitarias. Verifica tu
      conexión e intenta nuevamente.
    </Text>
    <Button onPress={onRefresh} variant="outline" className="border-red-200">
      <View className="flex-row items-center">
        <FontAwesome name="refresh" size={16} className="text-red-600 mr-2" />
        <Text className="text-red-600 font-medium">Intentar de nuevo</Text>
      </View>
    </Button>
  </View>
);

const RoutesScreen: React.FC = () => {
  const params = useMemo(() => ({ perPage: 100 }), []);
  const { data: routes, isLoading, error, refresh } = useRoutes(params);

  const handleRoutePress = (route: Route) => {
    // Aquí navegarías a la pantalla de detalle de la ruta
    console.log("Navegar a ruta:", route.name);
  };

  const handleRefresh = () => {
    refresh();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-4 py-6 border-b border-slate-200 bg-white">
          <View className="flex-row items-center">
            <View className="bg-primary/10 rounded-full p-2 mr-3">
              <FontAwesome name="book" size={24} className="text-primary" />
            </View>
            <View>
              <Text className="text-slate-900 text-2xl font-bold">Rutas</Text>
              <Text className="text-slate-600 text-sm">
                Sistema de navegación universitaria
              </Text>
            </View>
          </View>
        </View>
        <ScrollView className="flex-1">
          <LoadingState />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-4 py-6 border-b border-slate-200 bg-white">
          <View className="flex-row items-center">
            <View className="bg-primary/10 rounded-full p-2 mr-3">
              <FontAwesome
                name="bookmark-o"
                size={24}
                className="text-primary"
              />
            </View>
            <View>
              <Text className="text-slate-900 text-2xl font-bold">Rutas</Text>
              <Text className="text-slate-600 text-sm">
                Sistema de navegación universitaria
              </Text>
            </View>
          </View>
        </View>
        <ErrorState onRefresh={handleRefresh} />
      </SafeAreaView>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-4 py-6 border-b border-slate-200 bg-white">
          <View className="flex-row items-center">
            <View className="bg-primary/10 rounded-full p-2 mr-3">
              <FontAwesome name="book" size={24} className="text-primary" />
            </View>
            <View>
              <Text className="text-slate-900 text-2xl font-bold">Rutas</Text>
              <Text className="text-slate-600 text-sm">
                Sistema de navegación universitaria
              </Text>
            </View>
          </View>
        </View>
        <EmptyState onRefresh={handleRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 py-6 border-b border-slate-200 bg-white">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-primary/10 rounded-full p-2 mr-3">
              <FontAwesome name="book" size={24} className="text-primary" />
            </View>
            <View>
              <Text className="text-slate-900 text-2xl font-bold">Rutas</Text>
              <Text className="text-slate-600 text-sm">
                Sistema de navegación universitaria
              </Text>
            </View>
          </View>
          <Text className="text-primary font-semibold text-sm bg-primary/10 px-3 py-1 rounded-full">
            {routes.length} {routes.length === 1 ? "ruta" : "rutas"}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onPress={() => handleRoutePress(route)}
          />
        ))}

        {/* Footer info */}
        <View className="mt-8 pt-6 border-t border-slate-200">
          <View className="flex-row items-center justify-center">
            <FontAwesome
              name="map-pin"
              size={16}
              className="text-slate-400 mr-2"
            />
            <Text className="text-slate-500 text-sm text-center">
              Rutas actualizadas automáticamente
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoutesScreen;
