import {
  BROADCAST_HOST,
  BROADCAST_KEY,
  BROADCAST_PORT,
  BROADCAST_SECURE,
} from "@/config/config";
import { ApiRoutes } from "@/constants/apiRoutes";
import axiosClient from "@/services/axiosClient";

export type LocationPayload = {
  location: { latitude: number; longitude: number };
  user: { id: number; name: string };
  additional: {
    bus_id: number | string;
    status?: string;
    route_id?: number | string;
  };
};

let ws: WebSocket | null = null;
let heartbeatInterval: number | null = null;

const buildWSUrl = () => {
  const protocol = BROADCAST_SECURE ? "wss" : "ws";
  const host = BROADCAST_HOST;
  const port = BROADCAST_PORT;
  const appKey = BROADCAST_KEY;
  // Protocolo Pusher-compatible que usa laravel-websockets
  return `${protocol}://${host}:${port}/app/${appKey}?protocol=7&client=js&version=8.4.0-rc2&flash=false`;
};

type OnLocationFn = (payload: LocationPayload) => void;

export async function connectToPrivateChannel(
  channelName: string,
  onLocation: OnLocationFn
) {
  if (ws) {
    try {
      ws.close();
    } catch {}
    ws = null;
  }

  const url = buildWSUrl();
  console.log("🌐 WS →", url);
  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("✅ WS conectado");
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: "pusher:ping", data: {} }));
      }
    }, 25000);
  };

  ws.onmessage = async (message) => {
    let data: any;
    try {
      data = JSON.parse(message.data);
    } catch {
      return;
    }
    // Log global de todo
    console.log("📬", data.event, data.data ?? "");

    // 1) socket_id
    if (data.event === "pusher:connection_established") {
      try {
        const payload = JSON.parse(data.data);
        const socketId = payload.socket_id;
        console.log("🔑 socket_id:", socketId);

        // 2) auth
        const { data: authData } = await axiosClient.post(
          ApiRoutes.BROADCAST_AUTH,
          {
            socket_id: socketId,
            channel_name: channelName,
          }
        );
        console.log("✅ auth OK");

        // 3) subscribe
        ws?.send(
          JSON.stringify({
            event: "pusher:subscribe",
            data: { channel: channelName, auth: authData.auth },
          })
        );
        console.log("📡 subscribe enviado:", channelName);
      } catch (e: any) {
        console.error(
          "❌ auth/subscribe:",
          e?.response?.data || e?.message || e
        );
      }
      return;
    }

    if (data.event === "pusher_internal:subscription_succeeded") {
      console.log("✅ suscripción confirmada");
      return;
    }

    if (data.event === "pusher:error") {
      console.log("⚠️ pusher:error", data?.data || data);
      return;
    }

    // Detectar payload de ubicación, venga como objeto o string
    const looksLikeLocation =
      (typeof data?.data === "object" &&
        data?.data?.location &&
        data?.data?.additional) ||
      (typeof data?.data === "string" &&
        data?.data.includes('"location"') &&
        data?.data.includes('"additional"'));

    if (looksLikeLocation) {
      let payload = data.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {}
      }
      onLocation(payload as LocationPayload);
      return;
    }

    // Por nombre de evento
    if (
      data.event === "NewLocationReceived" ||
      data.event?.toLowerCase?.().includes("location")
    ) {
      let payload = data.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {}
      }
      onLocation(payload as LocationPayload);
    }
  };

  ws.onerror = (err) => {
    console.error("❌ WS error:", err);
  };

  ws.onclose = (e) => {
    console.log("⛔ WS cerrado:", e?.code, e?.reason);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };

  return ws;
}

export function disconnectWS() {
  if (ws) {
    try {
      ws.close();
    } catch {}
    ws = null;
  }
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}
