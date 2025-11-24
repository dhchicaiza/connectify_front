import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import useAuthStore from "../../stores/useAuthStore";

/**
 * Interface for chat messages exchanged in real-time.
 */
export interface Message {
  user: string;
  text: string;
  time: string;
  room?: string;
}

/**
 * Chat server API URL loaded from environment variables.
 */
export const API_CHAT = import.meta.env.VITE_CHAT_URL

/**
 * Custom React hook for managing real-time chat functionality in meetings.
 * Handles socket connection, message sending/receiving, and state management.
 * 
 * @param {string | undefined} meetingId - The meeting/room ID to connect to.
 * @returns {Object} Object containing messages, messageText, setMessageText, sendMessage, and username.
 */
export function useChat(meetingId: string | undefined) {
  const chatSocket = useRef<Socket | null>(null);

  const user = useAuthStore((state) => state.user);
  const username =
    user?.displayName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email ||
    "Desconocido";

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (!meetingId) return;

    const cSocket = io(API_CHAT, {
      query: { room: meetingId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500,
    });
    chatSocket.current = cSocket;

    const handleReceive = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    cSocket.on("receiveMessage", handleReceive);

    return () => {
      cSocket.off("receiveMessage");
      cSocket.disconnect();
    };
  }, [meetingId]);

  const sendMessage = () => {
    if (!chatSocket.current || !messageText.trim()) return;

    if (!username) {
      return;
    }

    const msg: Message = {
      user: username,
      text: messageText,
      time: new Date().toLocaleTimeString(),
      room: meetingId || "",
    };

    chatSocket.current.emit("sendMessage", msg);
    setMessageText("");
  };

  return {
    messages,
    messageText,
    setMessageText,
    sendMessage,
    username,
  };
}
