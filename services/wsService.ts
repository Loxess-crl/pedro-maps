// services/wsService.ts
import { ApiRoutes } from "@/constants/apiRoutes";
import axiosClient from "@/services/axiosClient";

let ws: WebSocket | null = null;
let heartbeatInterval: number | null = null;

/**
 * Conectar a Laravel WebSockets self-hosted y suscribirse a canal privado
 */
export const connectToChannel = async (
  channelName: string,
  eventName: string,
  callback: (data: any) => void
) => {
  if (ws) {
    console.log("⚠️ Ya existe WebSocket, desconectando...");
    ws.close();
    ws = null;
  }

  // URL de conexión básica (sin auth todavía)
  const protocol =
    process.env.EXPO_PUBLIC_BROADCAST_SECURE === "true" ? "wss" : "ws";
  const host = process.env.EXPO_PUBLIC_BROADCAST_HOST!;
  const port = process.env.EXPO_PUBLIC_BROADCAST_PORT!;
  const appKey = process.env.EXPO_PUBLIC_BROADCAST_KEY!;
  const url = `${protocol}://${host}:${port}/app/${appKey}?protocol=7&client=js&version=8.4.0-rc2&flash=false`;

  console.log("🌐 Conectando WebSocket a:", url);
  ws = new WebSocket(url);

  let socketId: string | null = null;
  console.log("🌐 Conectando WebSocket a:", url);
  console.log("socketId:", socketId);

  ws.onopen = () => {
    console.log("✅ WebSocket conectado");

    // Heartbeat cada 25s
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: "pusher:ping" }));
      }
    }, 25000);
  };

  ws.onmessage = async (message) => {
    try {
      const data = JSON.parse(message.data);

      // Log completo de todo lo que llega
      console.log(
        "📬 Mensaje WebSocket recibido:",
        JSON.stringify(data, null, 2)
      );

      // Primer mensaje: connection_established → obtengo socket_id
      if (data.event === "pusher:connection_established") {
        const payload = JSON.parse(data.data);
        const socketId = payload.socket_id;
        console.log("🔑 Socket ID recibido:", socketId);

        // Hacer auth del canal privado
        try {
          const { data: authData } = await axiosClient.post(
            ApiRoutes.BROADCAST_AUTH,
            {
              socket_id: socketId,
              channel_name: channelName,
            }
          );
          console.log("✅ Auth recibido:", authData);

          // Suscribirse al canal privado
          ws?.send(
            JSON.stringify({
              event: "pusher:subscribe",
              data: {
                channel: channelName,
                auth: authData.auth,
              },
            })
          );
          console.log(`📡 Subscrito a canal: ${channelName}`);
        } catch (err) {
          console.error("❌ Error en authorizer:", err);
        }
      }

      // Eventos de tu canal privado
      if (data.event === eventName) {
        console.log("📨 Evento de ubicación recibido:", data.data);
        callback(data.data);
      }

      // Otros eventos internos (pusher:ping, pusher:pong, pusher:error, etc.)
      if (
        ![
          "pusher:connection_established",
          "pusher:ping",
          "pusher:pong",
          eventName,
        ].includes(data.event)
      ) {
        console.log("ℹ️ Otro evento interno recibido:", data.event, data.data);
      }
    } catch (err) {
      console.error("❌ Error parseando mensaje WebSocket:", err);
    }
  };

  ws.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  ws.onclose = () => {
    console.log("⛔ WebSocket desconectado");
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };
};

/**
 * Desconectar WebSocket
 */
export const disconnectWS = () => {
  if (ws) {
    console.log("⏹ Cerrando WebSocket...");
    ws.close();
    ws = null;
  }
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};
