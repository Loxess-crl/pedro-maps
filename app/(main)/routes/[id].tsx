import { DIRECTIONAL_MAPS_API_KEY } from "@/config/config";
import { Point } from "@/interfaces/schedule.interface";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, StatusBar, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

export default function RouteMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { name, description, points } = useLocalSearchParams<{
    name: string;
    description: string;
    points: string;
  }>();

  const coordinates = (JSON.parse(points) as Point[]).map((p) => ({
    latitude: parseFloat(p.latitude),
    longitude: parseFloat(p.longitude),
  }));

  // Distancia
  const calculateDistance = () => {
    if (coordinates.length < 2) return "0 km";
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const lat1 = coordinates[i - 1].latitude;
      const lon1 = coordinates[i - 1].longitude;
      const lat2 = coordinates[i].latitude;
      const lon2 = coordinates[i].longitude;

      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }
    return `${totalDistance.toFixed(1)} km`;
  };

  const zoomToFit = useCallback(() => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [mapRef, coordinates]);

  useEffect(() => {
    setTimeout(zoomToFit, 500);
  }, [zoomToFit]);

  // Snap points del BottomSheet
  const snapPoints = useMemo(() => ["20%", "60%", "90%"], []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#2873b4" />

      {/* Header */}
      <LinearGradient
        colors={["#2873b4", "#7bd2e6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: StatusBar.currentHeight || 44,
          paddingBottom: 16,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>

          <View className="flex-1 mx-4">
            <Text className="text-white text-lg font-bold text-center">
              Ruta Universitaria
            </Text>
          </View>

          <Pressable
            onPress={zoomToFit}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <MaterialIcons name="my-location" size={20} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: coordinates[0]?.latitude || -12.0464,
          longitude: coordinates[0]?.longitude || -77.0428,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={[
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
        ]}
      >
        {/* Inicio y fin */}
        {coordinates.length > 0 && (
          <>
            <Marker coordinate={coordinates[0]} title="Punto de Inicio" />
            {coordinates.length > 1 && (
              <Marker
                coordinate={coordinates[coordinates.length - 1]}
                title="Destino Final"
              />
            )}
          </>
        )}

        {/* Direcciones con Google */}
        {coordinates.length >= 2 && (
          <MapViewDirections
            origin={coordinates[0]}
            destination={coordinates[coordinates.length - 1]}
            waypoints={coordinates.slice(1, -1)}
            apikey={DIRECTIONAL_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor="#2873b4"
            optimizeWaypoints
            onReady={(result) => {
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }}
            onError={(err) => {
              console.log("Error en Google Directions:", err);
            }}
          />
        )}
      </MapView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header card */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                {name}
              </Text>
              <Text className="text-gray-600 text-base leading-6">
                {description}
              </Text>
            </View>
            <View className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
              <FontAwesome5 name="route" size={24} color="white" />
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                <FontAwesome5
                  name="ruler-horizontal"
                  size={16}
                  color="#2563eb"
                />
              </View>
              <Text className="text-sm text-gray-500">Distancia</Text>
              <Text className="text-lg font-bold text-gray-900">
                {calculateDistance()}
              </Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-yellow-100 items-center justify-center mb-2">
                <FontAwesome5 name="clock" size={16} color="#d97706" />
              </View>
              <Text className="text-sm text-gray-500">Tiempo</Text>
              <Text className="text-lg font-bold text-gray-900">~25min</Text>
            </View>
          </View>

          {/* Info extra */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <FontAwesome5 name="info-circle" size={18} color="#2873b4" />
              <Text className="text-lg font-semibold text-blue-900 ml-2">
                Información Adicional
              </Text>
            </View>
            <Text className="text-blue-800 leading-6">
              Esta ruta ha sido optimizada para el transporte universitario.
              Recuerda seguir las señalizaciones y respetar las normas de
              tránsito.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
