import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import Cookies from 'js-cookie';
import { GeoRankWebSocket } from "@/lib/websocket";

type WebSocketContextType = {
  isConnected: boolean;
  ws: GeoRankWebSocket | null;
};

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  ws: null,
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<GeoRankWebSocket | null>(null);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) return;

    const ws = new GeoRankWebSocket();
    wsRef.current = ws;

    ws.on("connected", () => setIsConnected(true));
    ws.on("disconnected", () => setIsConnected(false));
    ws.connect(token);

    return () => ws.disconnect();
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, ws: wsRef.current }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
