import { io, Socket } from "socket.io-client";

/**
 * Socket connection instance for real-time chat communication.
 * Connects to the chat server using the URL from environment variables.
 */
let socket: Socket | null = null;

/**
 * Connects to the chat server and joins a specific room.
 *
 * @function connectToChat
 * @param {string} roomId - The meeting/room ID to join.
 * @returns {Socket} The socket instance for the connection.
 *
 * @example
 * const socket = connectToChat("meeting-uuid");
 * socket.on("receiveMessage", (msg) => console.log(msg));
 */
export function connectToChat(roomId: string): Socket {
  if (socket && socket.connected) {
    // If already connected, just join the new room
    socket.emit("joinRoom", roomId);
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Get socket URL from environment, with explicit fallback
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
  const socketUrl = envSocketUrl || "http://localhost:3001";
  
  // Warn if using localhost fallback (might not work for remote connections)
  if (!envSocketUrl) {
    console.warn("⚠️ ADVERTENCIA: VITE_SOCKET_URL no está configurado en .env");
    console.warn("   Usando fallback: http://localhost:3001");
    console.warn("   Si trabajas en red local, crea un archivo .env con:");
    console.warn("   VITE_SOCKET_URL=http://[IP_DEL_SERVIDOR]:3001");
    console.warn("   Ejemplo: VITE_SOCKET_URL=http://192.168.1.100:3001");
  }
  
  console.log("🔌 Socket connection details:");
  console.log("   VITE_SOCKET_URL from env:", envSocketUrl || "(no configurado)");
  console.log("   Final socket URL:", socketUrl);
  console.log("   Room ID:", roomId);
  
  // Validate and correct URL if needed
  let finalSocketUrl = socketUrl;
  if (socketUrl.includes(":3000") && !socketUrl.includes(":3001")) {
    console.error("❌ ERROR: Socket URL is pointing to port 3000 instead of 3001!");
    console.error("   This will fail. Please set VITE_SOCKET_URL=http://localhost:3001");
    console.error("   Auto-correcting to port 3001...");
    // Force correct URL - remove /api if present and change port
    finalSocketUrl = socketUrl.replace(":3000", ":3001").replace("/api", "").replace(/\/$/, "");
    console.log("   ✅ Corrected URL:", finalSocketUrl);
  }
  
  // Check server health asynchronously (non-blocking)
  const healthUrl = finalSocketUrl.replace(/\/$/, "") + "/health";
  fetch(healthUrl)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return null;
    })
    .then((data) => {
      if (data) {
        console.log("   ✅ Server health check passed:", data);
      }
    })
    .catch((error) => {
      console.warn("   ⚠️ Server health check failed (continuing anyway):", error);
    });
  
  return connectToChatWithUrl(finalSocketUrl, roomId);
}

/**
 * Internal function to create socket connection with a specific URL.
 */
function connectToChatWithUrl(socketUrl: string, roomId: string): Socket {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  console.log("🔌 Creating socket with URL:", socketUrl);
  
  socket = io(socketUrl, {
    query: { room: roomId },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("✅ Connected to chat server:", socket?.id);
    if (roomId && socket) {
      socket.emit("joinRoom", roomId);
      console.log("Joined room:", roomId);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected from chat server:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Chat connection error:", error);
    console.error("Socket URL attempted:", socketUrl);
    console.error("Error message:", error.message);
    
    // Provide helpful error message for common issues
    if (socketUrl.includes("localhost") && !socketUrl.includes("127.0.0.1")) {
      console.error("");
      console.error("💡 SOLUCIÓN: Si estás en otra computadora o en red local:");
      console.error("   1. Crea un archivo .env en la raíz del proyecto frontend");
      console.error("   2. Agrega: VITE_SOCKET_URL=http://[IP_DEL_SERVIDOR]:3001");
      console.error("   3. Reemplaza [IP_DEL_SERVIDOR] con la IP del servidor");
      console.error("   4. Reinicia el servidor de desarrollo (npm run dev)");
      console.error("");
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Reconnected to chat server after", attemptNumber, "attempts");
    if (roomId && socket) {
      socket.emit("joinRoom", roomId);
    }
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("🔄 Reconnection attempt:", attemptNumber);
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ Reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Failed to reconnect to chat server");
  });

  return socket;
}

/**
 * Gets the current socket instance if connected.
 *
 * @function getSocket
 * @returns {Socket | null} The current socket instance or null if not connected.
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnects from the chat server.
 *
 * @function disconnectSocket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}