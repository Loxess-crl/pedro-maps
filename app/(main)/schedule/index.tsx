import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchedule } from "@/hooks/useSchedule";
import { Schedule } from "@/interfaces/schedule.interface";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  addWeeks,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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

const ScheduleCard: React.FC<{ schedule: Schedule; index: number }> = ({
  schedule,
  index,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)}
      className="mb-4"
      style={{ transform: [{ scale: 0.98 }], opacity: 0.95 }}
    >
      <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
        <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2873b4] to-[#7bd2e6]" />

        <CardHeader className="p-4 pb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-[#ffc300] mr-2" />
                <Text className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                  {schedule.route.name}
                </Text>
              </View>
              <Text className="text-slate-900 text-lg font-bold leading-tight">
                {schedule.t_start.slice(0, 5)} - {schedule.t_end.slice(0, 5)}
              </Text>
            </View>
            <View className="bg-primary/10 rounded-xl p-3">
              <Ionicons name="time-outline" size={24} color="#2873b4" />
            </View>
          </View>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <View className="bg-slate-50 rounded-xl p-3">
            <View className="flex-row items-center">
              <Ionicons
                name="person-circle-outline"
                size={28}
                color="#2873b4"
                className="mr-2"
              />
              <View>
                <Text className="text-slate-700 text-sm font-medium">
                  {schedule.driver.name} {schedule.driver.ln_pat}
                </Text>
                <Text className="text-slate-500 text-xs">Conductor</Text>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </Animated.View>
  );
};

const LoadingState: React.FC = () => (
  <View className="px-5 py-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <Card
        key={index}
        className="bg-white border-0 shadow-lg rounded-2xl mb-4 overflow-hidden"
      >
        <View className="absolute top-0 left-0 right-0 h-1 bg-slate-200" />
        <CardHeader className="p-4 pb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Skeleton className="h-3 w-1/2 bg-slate-200 rounded-full mb-3" />
              <Skeleton className="h-6 w-3/4 bg-slate-200 rounded-lg" />
            </View>
            <Skeleton className="w-12 h-12 bg-slate-200 rounded-xl" />
          </View>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Skeleton className="h-12 bg-slate-200 rounded-xl" />
        </CardContent>
      </Card>
    ))}
  </View>
);

const EmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <View className="flex-1 items-center justify-center px-8 py-16">
    <View className="bg-gradient-to-br from-[#7bd2e6]/20 to-[#2873b4]/20 rounded-3xl p-8 mb-8">
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <Ionicons name="calendar-outline" size={64} color="#7bd2e6" />
      </View>
    </View>
    <Text className="text-slate-900 text-2xl font-bold text-center mb-3">
      Sin horarios programados
    </Text>
    <Text className="text-slate-600 text-base text-center leading-6 mb-8 max-w-xs opacity-80">
      No hay horarios para la semana seleccionada. Prueba con otra semana o
      actualiza.
    </Text>
    <TouchableOpacity
      onPress={onRefresh}
      className="bg-gradient-to-r from-[#2873b4] to-[#7bd2e6] rounded-2xl px-8 py-4 shadow-lg"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        <Ionicons name="refresh" size={20} color="white" />
        <Text className="text-white font-semibold text-base ml-2">
          Actualizar
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
      No pudimos cargar los horarios. Verifica tu conexión y vuelve a
      intentarlo.
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

  const groupedSchedules = useMemo(() => {
    if (!schedules) return {};
    const grouped: GroupedSchedules = {};
    schedules.forEach((schedule) => {
      const dayKey = schedule.sh_weekday;
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(schedule);
    });
    Object.keys(grouped).forEach((day) => {
      grouped[Number(day)].sort((a, b) => a.t_start.localeCompare(b.t_start));
    });
    return grouped;
  }, [schedules]);

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
      return `${format(start, "d")} - ${format(end, "d 'de' MMMM", { locale: es })}`;
    }
    return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM yyyy", { locale: es })}`;
  }, [selectedWeek]);

  const renderWeekOverview = () => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 20 }}
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
              className={`mr-3 p-3 rounded-2xl min-w-[64px] items-center border-2 transition-all duration-300 ${
                isSelectedDay
                  ? "bg-[#2873b4] border-[#2873b4]"
                  : "bg-white border-slate-200"
              } ${isTodayDay && !isSelectedDay ? "border-[#ffc300]" : ""}`}
            >
              <Text
                className={`text-xs font-semibold mb-1 ${
                  isSelectedDay ? "text-white/80" : "text-slate-500"
                }`}
              >
                {WEEKDAYS_SHORT[dayNum]}
              </Text>
              <Text
                className={`text-xl font-bold ${
                  isSelectedDay ? "text-white" : "text-slate-800"
                }`}
              >
                {format(dayDate, "d")}
              </Text>
              {hasSchedules && (
                <View
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full ${
                    isSelectedDay ? "bg-white" : "bg-[#2873b4]"
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
        <Animated.View
          key={dayNumber}
          className="mb-6 px-5"
          entering={FadeInUp}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text className="text-slate-900 text-xl font-bold mr-2">
                {WEEKDAYS[dayNumber]}
              </Text>
              <Badge className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Text className="text-xs font-semibold text-[#2873b4]">
                  {daySchedules.length} horario
                  {daySchedules.length !== 1 ? "s" : ""}
                </Text>
              </Badge>
            </View>
          </View>
          {daySchedules.map((schedule, index) => (
            <ScheduleCard key={schedule.id} schedule={schedule} index={index} />
          ))}
        </Animated.View>
      );
    },
    [selectedDay, groupedSchedules]
  );

  const MainContent = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState onRefresh={refresh} />;
    if (!schedules || schedules.length === 0) {
      return <EmptyState onRefresh={refresh} />;
    }

    const content = selectedDay
      ? renderDaySection(selectedDay)
      : [1, 2, 3, 4, 5, 6, 0].map(renderDaySection);

    const hasContent = Array.isArray(content)
      ? content.some((c) => c !== null)
      : content !== null;

    if (!hasContent && selectedDay) {
      return (
        <View className="items-center justify-center py-16 px-5">
          <View className="bg-primary/10 rounded-full p-5 mb-5">
            <Ionicons name="sad-outline" size={40} color="#2873b4" />
          </View>
          <Text className="text-slate-900 text-xl font-bold text-center mb-2">
            Sin horarios para este día
          </Text>
          <Text className="text-slate-600 text-base text-center leading-6 max-w-xs opacity-80">
            No hay actividades programadas para el {WEEKDAYS[selectedDay]}.
          </Text>
        </View>
      );
    }

    return <>{content}</>;
  };

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
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-1">
                Horario Semanal
              </Text>
              <Text className="text-white/80 text-base">
                Consulta la programación de rutas
              </Text>
            </View>
            <View className="bg-white/20 rounded-2xl p-3">
              <MaterialIcons name="schedule" size={32} color="white" />
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handlePreviousWeek}
              className="bg-white/20 rounded-full p-2 active:bg-white/30"
            >
              <Ionicons name="chevron-back" size={22} color="white" />
            </TouchableOpacity>

            <Pressable
              onPress={() => setSelectedWeek(new Date())}
              className="px-4 py-2"
            >
              <Text className="text-white text-lg font-bold text-center">
                {formatWeekRange()}
              </Text>
            </Pressable>

            <TouchableOpacity
              onPress={handleNextWeek}
              className="bg-white/20 rounded-full p-2 active:bg-white/30"
            >
              <Ionicons name="chevron-forward" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={["#2873b4"]}
            tintColor="#2873b4"
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl pt-6 min-h-screen">
          {!isLoading && !error && schedules && renderWeekOverview()}
          <MainContent />
        </View>
      </ScrollView>
    </View>
  );
}
