import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchedule } from "@/hooks/useSchedule";
import { Schedule } from "@/interfaces/schedule.interface";
import { FontAwesome } from "@expo/vector-icons";
import {
  addWeeks,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const WEEKDAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface GroupedSchedules {
  [key: number]: Schedule[];
}

export default function WeeklyScheduleScreen() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const params = useMemo(() => {
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });

    return {
      start_date: formatDate(start),
      end_date: formatDate(end),
    };
  }, [selectedWeek]);

  const { data: schedules, isLoading, error, refresh } = useSchedule(params);

  // Agrupar horarios por día de la semana con mejor lógica
  const groupedSchedules = useMemo(() => {
    if (!schedules) return {};

    const grouped: GroupedSchedules = {};

    schedules.forEach((schedule) => {
      const dayKey = schedule.sh_weekday;
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(schedule);
    });

    // Ordenar horarios por hora de inicio
    Object.keys(grouped).forEach((day) => {
      grouped[Number(day)].sort((a, b) => a.t_start.localeCompare(b.t_start));
    });

    return grouped;
  }, [schedules]);

  // Estadísticas de la semana
  const weekStats = useMemo(() => {
    const totalSchedules = schedules?.length || 0;
    const daysWithSchedules = Object.keys(groupedSchedules).length;
    const routesCount = new Set(schedules?.map((s) => s.route.id) || []).size;

    return {
      total: totalSchedules,
      days: daysWithSchedules,
      routes: routesCount,
    };
  }, [schedules, groupedSchedules]);

  // Navegación de semanas con animación
  const handlePreviousWeek = useCallback(() => {
    setSelectedWeek((prev) => subWeeks(prev, 1));
    setSelectedDay(null);
  }, []);

  const handleNextWeek = useCallback(() => {
    setSelectedWeek((prev) => addWeeks(prev, 1));
    setSelectedDay(null);
  }, []);

  const formatWeekRange = useCallback(() => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });

    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "d", { locale: es })} - ${format(end, "d 'de' MMMM yyyy", { locale: es })}`;
    }

    return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM yyyy", { locale: es })}`;
  }, [selectedWeek]);

  const getScheduleStatus = (schedule: Schedule) => {
    // Aquí puedes agregar lógica para determinar el estado del horario
    // Por ejemplo, si ya pasó, está activo, etc.
    return "scheduled"; // pending, active, completed, cancelled
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-600";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const renderScheduleItem = useCallback(
    (schedule: Schedule, index: number) => {
      const status = getScheduleStatus(schedule);

      return (
        <Animated.View
          key={schedule.id}
          entering={FadeInDown.delay(index * 50)}
        >
          <Card className="mb-3 bg-white border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-base font-semibold text-gray-900 mr-2">
                      {schedule.t_start} - {schedule.t_end}
                    </Text>
                    <Badge className={`${getStatusColor(status)} px-2 py-1`}>
                      <Text className="text-xs font-medium">Programado</Text>
                    </Badge>
                  </View>

                  <View className="flex-row items-center mb-1">
                    <FontAwesome name="map-marker" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-2 font-medium">
                      {schedule.route.name}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <FontAwesome name="user" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-500 ml-2">
                      {schedule.driver.name} {schedule.driver.ln_pat}
                    </Text>
                  </View>
                </View>

                <Pressable
                  className="bg-blue-50 rounded-full w-8 h-8 items-center justify-center active:bg-blue-100"
                  onPress={() => {
                    Alert.alert(
                      "Detalles del Horario",
                      `Ruta: ${schedule.route.name}\nConductor: ${schedule.driver.name} ${schedule.driver.ln_pat}\nHorario: ${schedule.t_start} - ${schedule.t_end}`
                    );
                  }}
                >
                  <FontAwesome name="info" size={14} color="#3B82F6" />
                </Pressable>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      );
    },
    []
  );

  const renderWeekOverview = () => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
          const dayDate = new Date(start);
          dayDate.setDate(start.getDate() + (dayNum === 0 ? 6 : dayNum - 1));
          const hasSchedules = groupedSchedules[dayNum]?.length > 0;
          const isSelectedDay = selectedDay === dayNum;
          const isTodayDay = isToday(dayDate);

          return (
            <Pressable
              key={dayNum}
              onPress={() => setSelectedDay(isSelectedDay ? null : dayNum)}
              className={`mr-3 p-3 rounded-xl min-w-[70px] items-center ${
                isSelectedDay
                  ? "bg-blue-500"
                  : hasSchedules
                    ? "bg-white border-2 border-blue-200"
                    : "bg-gray-50"
              } ${isTodayDay ? "ring-2 ring-orange-300" : ""}`}
            >
              <Text
                className={`text-xs font-medium mb-1 ${
                  isSelectedDay ? "text-white" : "text-gray-600"
                }`}
              >
                {WEEKDAYS_SHORT[dayNum]}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isSelectedDay
                    ? "text-white"
                    : isTodayDay
                      ? "text-orange-600"
                      : "text-gray-900"
                }`}
              >
                {format(dayDate, "d")}
              </Text>
              {hasSchedules && (
                <View
                  className={`mt-1 w-2 h-2 rounded-full ${
                    isSelectedDay ? "bg-white" : "bg-blue-500"
                  }`}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  const renderDaySection = useCallback(
    (dayNumber: number) => {
      const daySchedules = groupedSchedules[dayNumber];
      if (!daySchedules || daySchedules.length === 0) return null;

      if (selectedDay && selectedDay !== dayNumber) return null;

      return (
        <Animated.View key={dayNumber} className="mb-6" entering={FadeInUp}>
          <View className="flex-row items-center justify-between mb-4 px-1">
            <View className="flex-row items-center">
              <Text className="text-xl font-bold text-gray-900 mr-2">
                {WEEKDAYS[dayNumber]}
              </Text>
              <Badge className="bg-blue-100 text-blue-800 px-2 py-1">
                <Text className="text-xs font-medium">
                  {daySchedules.length} horario
                  {daySchedules.length !== 1 ? "s" : ""}
                </Text>
              </Badge>
            </View>
          </View>
          {daySchedules.map((schedule, index) =>
            renderScheduleItem(schedule, index)
          )}
        </Animated.View>
      );
    },
    [selectedDay, groupedSchedules, renderScheduleItem]
  );

  const renderSkeletonLoading = () => (
    <ScrollView className="flex-1 p-4">
      {[1, 2, 3].map((i) => (
        <View key={i} className="mb-6">
          <Skeleton className="h-6 w-24 mb-3 bg-gray-200" />
          {[1, 2].map((j) => (
            <Card key={j} className="mb-3 bg-white">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-32 mb-2 bg-gray-200" />
                <Skeleton className="h-3 w-48 mb-1 bg-gray-200" />
                <Skeleton className="h-3 w-40 bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInUp}
      className="flex-1 justify-center items-center px-6"
    >
      <View className="bg-blue-50 rounded-full w-20 h-20 justify-center items-center mb-6">
        <FontAwesome name="calendar-o" size={32} color="#3B82F6" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Sin horarios programados
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6 leading-6">
        No hay horarios para la semana seleccionada.{"\n"}
        Intenta con otra semana o actualiza la información.
      </Text>
      <Button
        onPress={refresh}
        className="flex-row items-center gap-2 bg-blue-500"
        size="lg"
      >
        <FontAwesome name="refresh" size={16} color="white" />
        <Text className="text-white font-medium">Actualizar</Text>
      </Button>
    </Animated.View>
  );

  const renderErrorState = () => (
    <Animated.View
      entering={FadeInUp}
      className="flex-1 justify-center items-center px-6"
    >
      <View className="bg-red-50 rounded-full w-20 h-20 justify-center items-center mb-6">
        <FontAwesome name="exclamation-triangle" size={32} color="#EF4444" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Error al cargar
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6 leading-6">
        No se pudieron cargar los horarios.{"\n"}
        Verifica tu conexión e intenta nuevamente.
      </Text>
      <Button onPress={refresh} className="bg-red-500" size="lg">
        <FontAwesome name="refresh" size={16} color="white" />
        <Text className="text-white font-medium ml-2">Reintentar</Text>
      </Button>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header mejorado */}
      <View className="bg-white border-b border-gray-100 shadow-sm">
        <View className="pt-12 pb-6 px-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Horarios
          </Text>

          {/* Estadísticas rápidas */}
          {!isLoading && !error && schedules && (
            <View className="flex-row justify-center items-center mb-4 space-x-6">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {weekStats.total}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">Total</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {weekStats.days}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">Días</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {weekStats.routes}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">Rutas</Text>
              </View>
            </View>
          )}

          {/* Navegación de semanas */}
          <View className="flex-row items-center justify-between mb-4">
            <Button
              size="icon"
              onPress={handlePreviousWeek}
              variant="outline"
              className="rounded-full border-gray-200"
            >
              <FontAwesome name="chevron-left" size={16} color="#6B7280" />
            </Button>

            <Pressable
              onPress={() => setSelectedWeek(new Date())}
              className="px-4 py-2 bg-gray-50 rounded-lg"
            >
              <Text className="text-lg font-semibold text-gray-800 text-center">
                {formatWeekRange()}
              </Text>
            </Pressable>

            <Button
              onPress={handleNextWeek}
              className="rounded-full border-gray-200"
              variant="outline"
              size="icon"
            >
              <FontAwesome name="chevron-right" size={16} color="#6B7280" />
            </Button>
          </View>
        </View>

        {/* Vista general de la semana */}
        {!isLoading && !error && schedules && renderWeekOverview()}
      </View>

      {/* Contenido principal */}
      {isLoading ? (
        renderSkeletonLoading()
      ) : error ? (
        renderErrorState()
      ) : !schedules || schedules.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {selectedDay ? (
            renderDaySection(selectedDay)
          ) : (
            <>
              {/* Filtro por días activo */}
              {selectedDay && (
                <View className="flex-row items-center mb-4">
                  <Button
                    onPress={() => setSelectedDay(null)}
                    variant="outline"
                    size="sm"
                    className="flex-row items-center gap-2"
                  >
                    <FontAwesome name="times" size={12} />
                    <Text>Ver todos los días</Text>
                  </Button>
                </View>
              )}

              {/* Renderizar días en orden */}
              {[1, 2, 3, 4, 5, 6, 0].map(renderDaySection)}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
