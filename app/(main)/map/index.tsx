import { connectToChannel, disconnectWS } from "@/services/wsService";
import React, { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const CHANNEL = "private-LocationChannel";

export default function RealTimeMapScreen() {
  const [connected, setConnected] = useState(false);
  const [busLocations, setBusLocations] = useState<any[]>([]);

  const handleConnect = async () => {
    try {
      await connectToChannel(CHANNEL, "", (data) => {
        // data tiene { location: {latitude, longitude}, additional, user }
        const parsedBus = {
          id: data.additional.bus_id,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          status: data.additional.status,
        };

        setBusLocations((prev) => {
          const index = prev.findIndex((b) => b.id === parsedBus.id);
          if (index !== -1) {
            prev[index] = parsedBus;
            return [...prev];
          }
          return [...prev, parsedBus];
        });
      });
      setConnected(true);
    } catch (err) {
      console.error("❌ Error conectando:", err);
    }
  };

  const handleDisconnect = () => {
    disconnectWS();
    setConnected(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: -6.7134,
          longitude: -79.9084,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {busLocations.map((bus) => (
          <Marker
            key={bus.id}
            coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
            title={`Bus ${bus.id}`}
            description={bus.status}
          />
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button
          title={connected ? "Desconectar" : "Conectar"}
          onPress={connected ? handleDisconnect : handleConnect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
  },
});
