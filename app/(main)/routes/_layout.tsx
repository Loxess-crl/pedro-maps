import { Stack } from "expo-router";

export default function RoutesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Rutas",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Mapa de ruta",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
