"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import { toast } from "sonner";
import { getCookie } from "cookies-next";
import { Message } from "@/lib/types";
import Navbar from "./navbar";
import SendMessage from "./send-message";
import TypingIndicator from "./typing-indicator";

interface ChatContentProps {
  uiMessages: Message[];
  isReadonly: boolean;
}

const formatMessage = (text: string) => {
  // Regex to match text wrapped with "#...#"
  const regex = /#([^#]+)#/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Replace the wrapped word with a highlighted, bold span
    parts.push(
      <span key={match.index} className="animate-highlight font-bold">
        {match[1]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

export function ChatContent({
  uiMessages: initialMessages,
  isReadonly,
}: ChatContentProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionJwtCookie = getCookie("stytch_session_jwt");
  const [isSending, setIsSending] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const scrollElement = scrollContainerRef.current;
      animate(scrollElement.scrollTop, scrollElement.scrollHeight, {
        onUpdate: (value) => {
          if (scrollElement) {
            scrollElement.scrollTop = value;
          }
        },
        duration: 0.5,
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let shouldReconnect = true;

    const connectWebSocket = () => {
      const token = sessionJwtCookie;
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const socket = new WebSocket(
        `${process.env.WEB_SOCKET_API}/ws?token=${token}`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection opened");
        toast.success("WebSocket connection opened");
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const data = event.data;
        const newMessage: Message = {
          id: Date.now().toString(),
          content: data,
          role: "assistant",
          created_at: new Date().toISOString(),
        };

        console.log("Received message:", newMessage);

        setMessages((prev) => [...prev, newMessage]);
        setIsSending(false);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("WebSocket error");
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
        if (shouldReconnect) {
          // Attempt to reconnect after 2 seconds.
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 2000);
        }
      };
    };

    connectWebSocket();

    // Cleanup: stop reconnection attempts and close socket.
    return () => {
      shouldReconnect = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-background w-full">
      <div className="flex flex-col size-full bg-background">
        <Navbar
          setMessages={setMessages}
          isConnected={isConnected}
          isReadonly={isReadonly}
        />

        <div
          ref={scrollContainerRef}
          className="p-4 space-y-4 h-full overflow-y-auto"
        >
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {formatMessage(message.content)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isSending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-muted rounded-2xl p-3.5 w-fit justify-start"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </div>

        <SendMessage
          setIsSending={setIsSending}
          isSending={isSending}
          setMessages={setMessages}
          socketRef={socketRef}
          isReadonly={isReadonly}
        />
      </div>
    </div>
  );
}
