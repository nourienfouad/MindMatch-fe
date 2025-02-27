import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SendMessageProps = {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  socketRef: React.MutableRefObject<WebSocket | null>;
  isReadonly: boolean;
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
  isSending: boolean;
};

export const SendMessage = ({
  setMessages,
  socketRef,
  isReadonly,
  setIsSending,
  isSending,
}: SendMessageProps) => {
  const [inputValue, setInputValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isSending) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket is not connected");
      return;
    }

    setIsSending(true);

    // Create and display the user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send the message over the WebSocket
    socketRef.current.send(inputValue.trim());
    setInputValue("");
  };

  useEffect(() => {
    if (textareaRef.current && !isSending) {
      textareaRef.current.focus();
    }
  }, [isSending]);

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-4">
        <Textarea
          ref={textareaRef}
          placeholder={isSending ? "Sending..." : "Message..."}
          className="max-h-[200px] w-full h-6"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && handleSendMessage()
          }
          disabled={isReadonly || isSending}
        />
        <Button onClick={handleSendMessage} disabled={isReadonly || isSending}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default SendMessage;
