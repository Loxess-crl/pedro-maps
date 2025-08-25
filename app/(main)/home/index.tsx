import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useTodaySchedule } from "@/hooks/useSchedule";
import {
  connectToPrivateChannel,
  disconnectWS,
  LocationPayload,
} from "@/services/wsService";
import { isWithinAnyWindow } from "@/utils/schedule";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const CHANNEL = "private-LocationChannel";
const BusPng = require("@/assets/images/bus.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Bus = {
  id: string | number;
  latitude: number;
  longitude: number;
  status?: string;
  routeId?: string | number;
  driver?: string;
  isNew?: boolean;
};

const AnimatedBusMarker = ({
  bus,
  isSelected,
  onPress,
}: {
  bus: Bus;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(bus.isNew ? 0 : 1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (bus.isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 4,
      }).start();
    }
  }, [bus.isNew, scaleAnim]);

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      ringAnim.setValue(0);
    }
  }, [isSelected, ringAnim]);

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <Marker
      coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
      onPress={onPress}
      title={`Bus ${bus.id}`}
      description={bus.status || "En ruta"}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={isSelected ? 1000 : 1}
    >
      <Animated.View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isSelected && (
          <Animated.View
            style={{
              position: "absolute",
              width: 80,
              alignItems: "center",
              justifyContent: "center",
              height: 80,
              borderRadius: 9999,
              borderWidth: 2,
              borderColor: "#3b82f6",
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            }}
          />
        )}

        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
          }}
        >
          <View
            className={`p-2 rounded-full border-2 ${
              isSelected
                ? "bg-blue-600 border-blue-400 shadow-lg"
                : "bg-white border-neutral-300 shadow-md"
            }`}
            style={{
              shadowColor: isSelected ? "#3b82f6" : "#000",
              shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
              shadowOpacity: isSelected ? 0.4 : 0.1,
              shadowRadius: isSelected ? 6 : 3,
              elevation: isSelected ? 6 : 3,
              padding: 2,
            }}
          >
            <Image
              source={BusPng}
              style={{
                width: 28,
                height: 28,
                tintColor: isSelected ? "white" : "#374151",
              }}
            />
          </View>

          <View
            className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full ${
              isSelected ? "bg-white" : "bg-blue-600"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isSelected ? "text-blue-600" : "text-white"
              }`}
            >
              {String(bus.id)}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Marker>
  );
};

const BusInfoCard = ({ bus, onClose }: { bus: Bus; onClose: () => void }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
      }}
      className="absolute bottom-48 left-4 right-4"
    >
      <Card className="bg-white rounded-2xl p-4 shadow-xl border-0">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-neutral-900">
              Bus {String(bus.id)}
            </Text>
            <Text className="text-neutral-600 mt-1">
              Conductor: {bus.driver || "No asignado"}
            </Text>
          </View>
          <Pressable
            onPress={handleClose}
            className="w-8 h-8 bg-neutral-100 rounded-full items-center justify-center"
          >
            <Text className="text-neutral-600 font-semibold">✕</Text>
          </Pressable>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <View
              className={`px-3 py-1 rounded-full self-start ${getStatusColor(bus.status)}`}
            >
              <Text className="text-sm font-medium">
                {bus.status || "En ruta"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-neutral-100">
          <Text className="text-xs text-neutral-500">
            Ubicación actualizada en tiempo real
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
};

const BusChip = ({
  bus,
  isSelected,
  onPress,
}: {
  bus: Bus;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(bus.isNew ? 0 : 1)).current;

  useEffect(() => {
    if (bus.isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 6,
      }).start();
    }
  }, [bus.isNew, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        className={`px-4 py-3 rounded-2xl min-w-[80px] items-center shadow-sm ${
          isSelected
            ? "bg-blue-600 shadow-lg"
            : "bg-white border border-neutral-200"
        }`}
        style={{
          shadowColor: isSelected ? "#3b82f6" : "#000",
          shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
          shadowOpacity: isSelected ? 0.3 : 0.1,
          shadowRadius: isSelected ? 8 : 4,
          elevation: isSelected ? 8 : 2,
        }}
      >
        <Text
          className={`font-bold text-sm ${
            isSelected ? "text-white" : "text-neutral-900"
          }`}
        >
          Bus {String(bus.id)}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            isSelected ? "text-blue-100" : "text-neutral-600"
          }`}
        >
          {bus.status || "En ruta"}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [buses, setBuses] = useState<Record<string | number, Bus>>({});
  const [selectedBusId, setSelectedBusId] = useState<string | number | null>(
    null
  );
  const [wsConnected, setWsConnected] = useState(false);
  const [hasInitialCameraSet, setHasInitialCameraSet] = useState(false);

  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    schedules,
    isLoading: schedulesLoading,
    error: schedulesError,
  } = useTodaySchedule();

  const serviceActive = useMemo(
    () => isWithinAnyWindow(schedules),
    [schedules]
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    let mounted = true;

    const connectWebSocket = async () => {
      try {
        await connectToPrivateChannel(CHANNEL, (payload: LocationPayload) => {
          const { location, additional, user: u } = payload;
          const id = additional?.bus_id ?? u?.id;
          if (!id || !location?.latitude || !location?.longitude) return;

          setBuses((prev) => {
            const isNewBus = !prev[id];
            return {
              ...prev,
              [id]: {
                id,
                latitude: location.latitude,
                longitude: location.longitude,
                status: additional?.status,
                routeId: additional?.route_id,
                driver: u?.name,
                isNew: isNewBus,
              },
            };
          });

          if (mounted) {
            setTimeout(() => {
              setBuses((prevBuses) => ({
                ...prevBuses,
                [id]: { ...prevBuses[id], isNew: false },
              }));
            }, 1000);
          }
        });

        if (mounted) setWsConnected(true);
      } catch (error) {
        console.log("Error conectando WebSocket:", error);
      }
    };

    connectWebSocket();

    return () => {
      mounted = false;
      disconnectWS();
      setWsConnected(false);
    };
  }, []);

  useEffect(() => {
    if (!hasInitialCameraSet && !selectedBusId) {
      const busList = Object.values(buses);
      if (busList.length > 0) {
        const firstBus = busList[0];
        setTimeout(() => {
          mapRef.current?.animateCamera(
            {
              center: {
                latitude: firstBus.latitude,
                longitude: firstBus.longitude,
              },
              zoom: 14,
            },
            { duration: 1000 }
          );
          setHasInitialCameraSet(true);
        }, 300);
      }
    }
  }, [buses, hasInitialCameraSet, selectedBusId]);

  const busList = useMemo(() => Object.values(buses), [buses]);
  const totalBuses = busList.length;
  const selectedBus = selectedBusId ? buses[selectedBusId] : null;

  useEffect(() => {
    if (selectedBusId && selectedBus) {
      setTimeout(() => {
        mapRef.current?.animateCamera(
          {
            center: {
              latitude: selectedBus.latitude,
              longitude: selectedBus.longitude,
            },
            zoom: 17,
          },
          { duration: 1000 }
        );
      }, 100);
    }
  }, [
    selectedBus?.latitude,
    selectedBus?.longitude,
    selectedBusId,
    selectedBus,
  ]);

  const handleSelectBus = useCallback(
    (busId: string | number) => {
      const bus = buses[busId];
      if (!bus) return;

      setSelectedBusId(busId);

      setTimeout(() => {
        mapRef.current?.animateCamera(
          {
            center: {
              latitude: bus.latitude,
              longitude: bus.longitude,
            },
            zoom: 17,
          },
          { duration: 800 }
        );
      }, 100);
    },
    [buses]
  );

  const handleCloseBusInfo = useCallback(() => {
    setSelectedBusId(null);
  }, []);

  // Ruta simulada
  const simulatedRoute = useMemo(() => {
    if (!selectedBus) return [];
    const { latitude, longitude } = selectedBus;
    return [
      { latitude, longitude },
      { latitude: latitude + 0.002, longitude: longitude + 0.002 },
      { latitude: latitude + 0.004, longitude: longitude + 0.001 },
      { latitude: latitude + 0.006, longitude: longitude - 0.001 },
    ];
  }, [selectedBus]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-1 bg-neutral-50"
    >
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: -6.7134,
          longitude: -79.9084,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        mapPadding={{
          top: 100,
          right: 20,
          bottom: selectedBus ? 200 : 120,
          left: 20,
        }}
      >
        {busList.map((bus) => (
          <AnimatedBusMarker
            key={String(bus.id)}
            bus={bus}
            isSelected={selectedBusId === bus.id}
            onPress={() => handleSelectBus(bus.id)}
          />
        ))}

        {/* Ruta simulada */}
        {selectedBus && simulatedRoute.length > 1 && (
          <Polyline
            coordinates={simulatedRoute}
            strokeWidth={4}
            strokeColor="#3b82f6"
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      <View className="absolute top-12 left-4 right-4">
        <Card className="bg-white/95 backdrop-blur rounded-2xl px-4 py-3 shadow-lg border-0">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <Text className="text-base font-bold text-neutral-900">
                {totalBuses} buses activos
              </Text>
            </View>
            {wsConnected && (
              <View className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </View>
        </Card>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="absolute bottom-28 left-0"
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 12,
          minWidth: SCREEN_WIDTH,
        }}
      >
        {busList.map((bus) => (
          <BusChip
            key={String(bus.id)}
            bus={bus}
            isSelected={selectedBusId === bus.id}
            onPress={() => handleSelectBus(bus.id)}
          />
        ))}

        {busList.length === 0 && !schedulesLoading && (
          <Card className="bg-white/95 rounded-2xl px-4 py-3 shadow-md">
            <Text className="text-neutral-600 font-medium">
              No hay buses disponibles
            </Text>
          </Card>
        )}
      </ScrollView>

      {selectedBus && (
        <BusInfoCard bus={selectedBus} onClose={handleCloseBusInfo} />
      )}

      {!serviceActive && !schedulesLoading && totalBuses === 0 && (
        <View className="absolute bottom-44 left-4 right-4">
          <Card className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Text className="text-amber-800 font-medium text-center">
              ⏰ Servicio fuera de horario
            </Text>
          </Card>
        </View>
      )}

      {schedulesError && (
        <View className="absolute bottom-44 left-4 right-4">
          <Card className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <Text className="text-red-800 font-medium text-center">
              ⚠️ Error cargando horarios
            </Text>
          </Card>
        </View>
      )}
    </Animated.View>
  );
}
