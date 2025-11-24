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
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  
  
  // Check server health asynchronously (non-blocking)
  const healthUrl = socketUrl.replace(/\/$/, "") + "/health";
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
  
  return connectToChatWithUrl(socketUrl, roomId);
}

/**
 * Internal function to create socket connection with a specific URL.
 * 
 * @param {string} socketUrl - The WebSocket server URL to connect to.
 * @param {string} roomId - The meeting/room ID to join after connection.
 * @returns {Socket} The socket instance for the connection.
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