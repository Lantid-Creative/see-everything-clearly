import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm Carson, your adaptive assistant. I can help you with sales outreach, research, email campaigns, and more. What would you like to work on today?",
};

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Untitled",
      messages: [welcomeMessage],
      createdAt: new Date(),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState("1");

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const createConversation = useCallback(() => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "Untitled",
      messages: [{ ...welcomeMessage, id: `welcome-${Date.now()}` }],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, []);

  const addMessage = useCallback((convId: string, message: ChatMessage) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        // Auto-title from first user message
        const isFirstUser = c.messages.filter((m) => m.role === "user").length === 0 && message.role === "user";
        return {
          ...c,
          title: isFirstUser ? message.content.slice(0, 40) + (message.content.length > 40 ? "..." : "") : c.title,
          messages: [...c.messages, message],
        };
      })
    );
  }, []);

  const updateLastAssistantMessage = useCallback((convId: string, content: string, isStreaming: boolean) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        const lastIdx = msgs.length - 1;
        if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
          msgs[lastIdx] = { ...msgs[lastIdx], content, isStreaming };
        }
        return { ...c, messages: msgs };
      })
    );
  }, []);

  const setMessageAction = useCallback((convId: string, messageId: string, action: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => (m.id === messageId ? { ...m, action } : m)),
        };
      })
    );
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    setMessageAction,
  };
}
