import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useEvents } from "@/hooks/useEvent";
import { Event, SeverityLevel } from "@/interfaces/event.interface";
import { cn } from "@/lib/utils";
import { connectToPrivateChannel, disconnectWS } from "@/services/wsService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { formatRelative } from "date-fns";
import { es } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";

const EVENTS_CHANNEL = "private-EventChannel";

const EventsPage = () => {
  const { data, isLoading, error, refresh } = useEvents();
  const [wsConnected, setWsConnected] = useState(false);
  const [hasNewEvents, setHasNewEvents] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  // WebSocket connection for real-time event updates
  useEffect(() => {
    let mounted = true;

    const connectWebSocket = async () => {
      try {
        await connectToPrivateChannel(EVENTS_CHANNEL, (payload: any) => {
          console.log("📬 Evento recibido en EventChannel:", payload);

          // Cuando llega un evento, activamos el indicador de nuevos eventos
          if (mounted) {
            setHasNewEvents(true);

            // Auto-refresh después de un breve delay para mostrar el indicador
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current);
            }

            refreshTimeoutRef.current = setTimeout(() => {
              if (mounted) {
                refresh();
                setHasNewEvents(false);
              }
            }, 1500); // 1.5 segundos para mostrar el indicador
          }
        });

        if (mounted) setWsConnected(true);
      } catch (error) {
        console.log("Error conectando WebSocket para eventos:", error);
      }
    };

    connectWebSocket();

    return () => {
      mounted = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      disconnectWS();
      setWsConnected(false);
    };
  }, [refresh]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Get severity color and label with modern styling
  const getSeverityConfig = (severity: SeverityLevel) => {
    switch (severity) {
      case "L":
        return {
          cardColor: "bg-emerald-50 border-emerald-200",
          accentColor: "bg-emerald-500",
          textColor: "text-emerald-800",
          badgeVariant: "secondary" as const,
          badgeColor: "bg-emerald-100 border-emerald-200",
          label: "Baja",
          icon: "info-outline",
          iconColor: "#10b981",
        };
      case "M":
        return {
          cardColor: "bg-amber-50 border-amber-200",
          accentColor: "bg-amber-500",
          textColor: "text-amber-800",
          badgeVariant: "outline" as const,
          badgeColor: "bg-amber-100 border-amber-200",
          label: "Media",
          icon: "warning-outline",
          iconColor: "#f59e0b",
        };
      case "H":
        return {
          cardColor: "bg-orange-50 border-orange-200",
          accentColor: "bg-orange-500",
          textColor: "text-orange-800",
          badgeVariant: "destructive" as const,
          badgeColor: "bg-orange-100 border-orange-200",
          label: "Alta",
          icon: "alert-circle-outline",
          iconColor: "#ea580c",
        };
      case "C":
        return {
          cardColor: "bg-red-50 border-red-200",
          accentColor: "bg-red-500",
          textColor: "text-red-800",
          badgeVariant: "destructive" as const,
          badgeColor: "bg-red-100 border-red-200",
          label: "Crítica",
          icon: "alert-outline",
          iconColor: "#dc2626",
        };
      default:
        return {
          cardColor: "bg-slate-50 border-slate-200",
          accentColor: "bg-slate-500",
          textColor: "text-slate-800",
          badgeVariant: "outline" as const,
          badgeColor: "bg-slate-100 border-slate-200",
          label: "Desconocida",
          icon: "help-circle-outline",
          iconColor: "#64748b",
        };
    }
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatRelative(date, new Date(), { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  // Check if event is expired
  const isEventExpired = (expiresAt: string) => {
    try {
      return new Date(expiresAt) < new Date();
    } catch {
      return false;
    }
  };

  // Check if event is active (between start_at and expires_at)
  const isEventActive = (startAt: string, expiresAt: string) => {
    try {
      const now = new Date();
      const start = new Date(startAt);
      const expires = new Date(expiresAt);
      return now >= start && now <= expires;
    } catch {
      return false;
    }
  };

  const renderEventItem = ({ item, index }: { item: Event; index: number }) => {
    const severityConfig = getSeverityConfig(item.severity);
    const expired = isEventExpired(item.expires_at);
    const active = isEventActive(item.start_at, item.expires_at);

    return (
      <TouchableOpacity
        className="mb-5"
        key={item.id || index}
        style={{
          transform: [{ scale: 0.98 }],
          opacity: expired ? 0.7 : 1,
        }}
        activeOpacity={0.8}
      >
        <Card
          className={cn(
            "mx-5 border-0 shadow-lg rounded-2xl overflow-hidden",
            severityConfig.cardColor,
            active && "shadow-xl"
          )}
        >
          {/* Top accent bar */}
          <View
            className={cn(
              "absolute top-0 left-0 right-0 h-1",
              severityConfig.accentColor
            )}
          />

          <CardHeader className="p-5 pb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-3">
                  <View
                    className={cn(
                      "rounded-full p-1.5 mr-3",
                      severityConfig.badgeColor
                    )}
                  >
                    <MaterialIcons
                      name={severityConfig.icon as any}
                      size={16}
                      color={severityConfig.iconColor}
                    />
                  </View>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "mr-2 rounded-full px-3 py-1",
                      severityConfig.badgeColor
                    )}
                  >
                    <Text className="text-xs font-medium">
                      {severityConfig.label.toUpperCase()}
                    </Text>
                  </Badge>
                  {active && (
                    <Badge
                      variant="default"
                      className="bg-blue-500 rounded-full px-3 py-1 shadow-sm"
                    >
                      <Text className="text-xs font-medium text-white">
                        ACTIVO
                      </Text>
                    </Badge>
                  )}
                  {expired && (
                    <Badge
                      variant="outline"
                      className="bg-slate-100 border-slate-300 rounded-full px-3 py-1"
                    >
                      <Text className="text-xs font-medium text-slate-600">
                        EXPIRADO
                      </Text>
                    </Badge>
                  )}
                </View>
                <Text
                  className={cn(
                    "text-xl font-bold leading-6 mb-2",
                    severityConfig.textColor,
                    expired && "text-slate-500"
                  )}
                >
                  {item.name}
                </Text>
              </View>
              <View
                className={cn(
                  "rounded-2xl p-4 shadow-md",
                  severityConfig.accentColor
                )}
              >
                <MaterialIcons name="notifications" size={28} color="white" />
              </View>
            </View>
          </CardHeader>

          <CardContent className="px-5 pb-5">
            <Text
              className={cn(
                "text-sm leading-6 mb-4 opacity-90",
                expired ? "text-slate-500" : "text-slate-700"
              )}
            >
              {item.description}
            </Text>

            <View className="bg-white/70 backdrop-blur rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 rounded-full p-2 mr-3">
                    <Ionicons name="play-circle" size={16} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-slate-700 text-sm font-medium">
                      Inicio del evento
                    </Text>
                    <Text className="text-slate-500 text-xs">
                      {getRelativeTime(item.start_at)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="bg-red-100 rounded-full p-2 mr-3">
                  <Ionicons name="stop-circle" size={16} color="#ef4444" />
                </View>
                <View>
                  <Text className="text-slate-700 text-sm font-medium">
                    Fecha de expiración
                  </Text>
                  <Text
                    className={cn(
                      "text-xs",
                      expired ? "text-red-600 font-semibold" : "text-slate-500"
                    )}
                  >
                    {getRelativeTime(item.expires_at)}
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderLoadingSkeleton = () => (
    <View className="px-5 py-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          className="bg-white border-0 shadow-lg rounded-2xl mb-5 overflow-hidden"
        >
          <View className="absolute top-0 left-0 right-0 h-1 bg-slate-200" />
          <CardHeader className="p-5 pb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-3">
                  <Skeleton className="w-8 h-8 bg-slate-200 rounded-full mr-3" />
                  <Skeleton className="w-16 h-6 bg-slate-200 rounded-full mr-2" />
                  <Skeleton className="w-12 h-6 bg-slate-200 rounded-full" />
                </View>
                <Skeleton className="h-6 bg-slate-200 rounded-lg mb-3 w-4/5" />
              </View>
              <Skeleton className="h-16 w-16 bg-slate-200 rounded-2xl" />
            </View>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <Skeleton className="h-4 bg-slate-200 rounded w-full mb-2" />
            <Skeleton className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
            <View className="bg-slate-50 rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <Skeleton className="w-8 h-8 bg-slate-200 rounded-full mr-3" />
                <View className="flex-1">
                  <Skeleton className="h-4 bg-slate-200 rounded w-2/3 mb-1" />
                  <Skeleton className="h-3 bg-slate-200 rounded w-1/2" />
                </View>
              </View>
              <View className="flex-row items-center">
                <Skeleton className="w-8 h-8 bg-slate-200 rounded-full mr-3" />
                <View className="flex-1">
                  <Skeleton className="h-4 bg-slate-200 rounded w-3/4 mb-1" />
                  <Skeleton className="h-3 bg-slate-200 rounded w-1/3" />
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 mb-8">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <MaterialIcons name="notifications-none" size={64} color="#6366f1" />
        </View>
      </View>

      <Text className="text-slate-900 text-2xl font-bold text-center mb-3">
        ¡Todo tranquilo por ahora!
      </Text>
      <Text className="text-slate-600 text-base text-center leading-6 mb-8 max-w-xs opacity-80">
        No hay eventos o notificaciones activas en este momento. Te mantendremos
        informado sobre cualquier novedad del transporte.
      </Text>

      <TouchableOpacity
        onPress={refresh}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl px-8 py-4 shadow-lg"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <Ionicons name="refresh" size={20} color="white" />
          <Text className="text-white font-semibold text-base ml-2">
            Actualizar eventos
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
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
        No pudimos cargar los eventos. Verifica tu conexión a internet y vuelve
        a intentarlo.
      </Text>

      <TouchableOpacity
        onPress={refresh}
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

  const getActiveEventsCount = () => {
    if (!data) return 0;
    return data.filter((event) =>
      isEventActive(event.start_at, event.expires_at)
    ).length;
  };

  const getCriticalEventsCount = () => {
    if (!data) return 0;
    return data.filter(
      (event) => event.severity === "C" || event.severity === "H"
    ).length;
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <LinearGradient
          colors={["#6366f1", "#8b5cf6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-5"
        >
          <SafeAreaView>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-1">
                  Eventos
                </Text>
                <Text className="text-white/80 text-base">
                  Sistema de notificaciones
                </Text>
              </View>
              <View className="bg-white/20 rounded-2xl p-3">
                <MaterialIcons
                  name="notifications-active"
                  size={32}
                  color="white"
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <ScrollView className="flex-1 -mt-4">
          <View className="bg-white rounded-t-3xl pt-6 min-h-full">
            {renderLoadingSkeleton()}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-50">
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <LinearGradient
          colors={["#6366f1", "#8b5cf6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-8 px-5"
        >
          <SafeAreaView>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-1">
                  Eventos
                </Text>
                <Text className="text-white/80 text-base">
                  Sistema de notificaciones
                </Text>
              </View>
              <View className="bg-white/20 rounded-2xl p-3">
                <MaterialIcons
                  name="notifications-active"
                  size={32}
                  color="white"
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View className="flex-1 bg-white rounded-t-3xl -mt-4">
          {renderErrorState()}
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 bg-slate-50">
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
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
                  Eventos
                </Text>
                <Text className="text-white/80 text-base">
                  Sistema de notificaciones
                </Text>
              </View>
              <View className="bg-white/20 rounded-2xl p-3">
                <MaterialIcons
                  name="notifications-active"
                  size={32}
                  color="white"
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View className="flex-1 bg-white rounded-t-3xl -mt-4">
          {renderEmptyState()}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

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
                Eventos
              </Text>
              <Text className="text-white/80 text-base">
                Sistema de notificaciones
              </Text>
            </View>
            <View className="bg-white/20 rounded-2xl p-3">
              <MaterialIcons
                name="notifications-active"
                size={32}
                color="white"
              />
            </View>
          </View>

          {/* Stats Card */}
          <View className="bg-white/10 backdrop-blur rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-yellow-400 rounded-full p-2 mr-3">
                <MaterialIcons name="event-note" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white text-lg font-bold">
                  {data.length}
                </Text>
                <Text className="text-white/70 text-sm">
                  {data.length === 1 ? "Evento total" : "Eventos totales"}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-3">
              {/* WebSocket connection indicator */}
              <View className="flex-row items-center">
                <View
                  className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    wsConnected ? "bg-green-400" : "bg-red-400"
                  )}
                />
                {wsConnected && (
                  <View className="w-2 h-2 bg-green-400 rounded-full animate-pulse absolute" />
                )}
              </View>

              {/* New events indicator */}
              {hasNewEvents && (
                <View className="bg-yellow-400/20 rounded-xl px-3 py-1">
                  <Text className="text-white text-xs font-semibold">
                    ACTUALIZANDO...
                  </Text>
                </View>
              )}

              <View className="bg-green-400/20 rounded-xl px-3 py-1">
                <Text className="text-white text-xs font-semibold">
                  {getActiveEventsCount()} ACTIVOS
                </Text>
              </View>
              {getCriticalEventsCount() > 0 && (
                <View className="bg-red-400/20 rounded-xl px-3 py-1">
                  <Text className="text-white text-xs font-semibold">
                    {getCriticalEventsCount()} CRÍTICOS
                  </Text>
                </View>
              )}
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
            onRefresh={refresh}
            colors={["#6366f1"]}
            tintColor="#6366f1"
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl pt-6 min-h-full">
          <View className="px-5 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-slate-900 text-xl font-bold">
                Notificaciones Activas
              </Text>
              {wsConnected && (
                <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-600 text-xs font-semibold">
                    EN VIVO
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-slate-600 text-sm opacity-80">
              Mantente informado sobre el estado del transporte universitario
            </Text>
            {hasNewEvents && (
              <View className="mt-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                <Text className="text-blue-700 text-sm font-medium text-center">
                  📬 Actualizando eventos en tiempo real...
                </Text>
              </View>
            )}
          </View>

          <View className="pb-8">
            {data.map((item, index) => renderEventItem({ item, index }))}
          </View>

          {/* Footer */}
          <View className="mt-8 pt-6 px-5 pb-8">
            <View className="bg-slate-50 rounded-2xl p-6 items-center">
              <View className="bg-blue-500/10 rounded-full p-3 mb-4">
                <MaterialIcons name="update" size={24} color="#6366f1" />
              </View>
              <Text className="text-slate-700 font-semibold text-center mb-1">
                Actualizaciones en tiempo real
              </Text>
              <Text className="text-slate-500 text-sm text-center mb-2">
                Los eventos se actualizan automáticamente para mantenerte
                informado
              </Text>
              <View className="flex-row items-center mt-2">
                <View
                  className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    wsConnected ? "bg-green-500" : "bg-red-500"
                  )}
                />
                <Text
                  className={cn(
                    "text-xs font-medium",
                    wsConnected ? "text-green-600" : "text-red-600"
                  )}
                >
                  {wsConnected
                    ? "Conectado al servidor"
                    : "Sin conexión en tiempo real"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EventsPage;
