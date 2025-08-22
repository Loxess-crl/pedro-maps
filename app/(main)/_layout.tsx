import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import Animated from "react-native-reanimated";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6366F1", // Indigo moderno
        tabBarInactiveTintColor: "#9CA3AF", // Gris suave
        tabBarStyle: {
          backgroundColor:
            Platform.OS === "ios" ? "rgba(255, 255, 255, 0.95)" : "#FFFFFF",
          borderTopWidth: 0,
          elevation: 20, // Android shadow
          shadowColor: "#000", // iOS shadow
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          height: Platform.OS === "ios" ? 85 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 25 : 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "absolute",
          marginHorizontal: 16,
          bottom: Platform.OS === "ios" ? 0 : 16,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          textTransform: "none",
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.95)", "rgba(248, 250, 252, 0.95)"]}
            style={{
              flex: 1,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 4,
          marginHorizontal: 2,
          borderRadius: 16,
        },
      }}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="schedule/index"
        options={{
          title: "Horarios",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View
              style={{
                backgroundColor: focused
                  ? "rgba(99, 102, 241, 0.1)"
                  : "transparent",
                padding: 2,
                borderRadius: 12,
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome
                size={focused ? 24 : 22}
                name="calendar"
                color={color}
              />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="routes/index"
        options={{
          title: "Rutas",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View
              style={{
                backgroundColor: focused
                  ? "rgba(99, 102, 241, 0.1)"
                  : "transparent",
                padding: 2,
                borderRadius: 12,
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome size={focused ? 24 : 22} name="road" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View
              style={{
                backgroundColor: focused
                  ? "#6366F1"
                  : "rgba(99, 102, 241, 0.1)",
                padding: 4,
                borderRadius: 12,
              }}
            >
              <FontAwesome
                size={focused ? 26 : 22}
                name="map"
                color={focused ? "#FFFFFF" : color}
              />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: "Notificaciones",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View
              style={{
                backgroundColor: focused
                  ? "rgba(99, 102, 241, 0.1)"
                  : "transparent",
                padding: 2,
                borderRadius: 12,
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome size={focused ? 24 : 22} name="bell" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View
              style={{
                backgroundColor: focused
                  ? "rgba(99, 102, 241, 0.1)"
                  : "transparent",
                padding: 2,
                borderRadius: 12,
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome size={focused ? 24 : 22} name="user" color={color} />
            </Animated.View>
          ),
        }}
      />
    </Tabs>
  );
}
