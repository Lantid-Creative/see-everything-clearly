import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  content:
    "Hi! I'm Carson, your adaptive assistant. I can help you with sales outreach, research, email campaigns, and more. What would you like to work on today?",
};

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const savingRef = useRef(false);

  // Load conversations from DB on mount
  useEffect(() => {
    async function load() {
      const { data: convRows } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!convRows || convRows.length === 0) {
        // Create initial conversation
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ title: "Untitled" })
          .select()
          .single();

        if (newConv) {
          // Insert welcome message
          await supabase.from("messages").insert({
            conversation_id: newConv.id,
            role: "assistant",
            content: welcomeMessage.content,
          });

          setConversations([
            {
              id: newConv.id,
              title: newConv.title,
              messages: [{ ...welcomeMessage, id: "welcome" }],
              createdAt: new Date(newConv.created_at),
            },
          ]);
          setActiveConversationId(newConv.id);
        }
      } else {
        // Load messages for all conversations
        const convs: Conversation[] = [];
        for (const conv of convRows) {
          const { data: msgs } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: true });

          convs.push({
            id: conv.id,
            title: conv.title,
            messages: (msgs || []).map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              action: m.action || undefined,
            })),
            createdAt: new Date(conv.created_at),
          });
        }
        setConversations(convs);
        setActiveConversationId(convRows[0].id);
      }
      setLoaded(true);
    }
    load();
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0] ||
    { id: "", title: "Untitled", messages: [], createdAt: new Date() };

  const createConversation = useCallback(async () => {
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({ title: "Untitled" })
      .select()
      .single();

    if (!newConv) return "";

    const welcomeId = crypto.randomUUID();
    await supabase.from("messages").insert({
      id: welcomeId,
      conversation_id: newConv.id,
      role: "assistant",
      content: welcomeMessage.content,
    });

    const conv: Conversation = {
      id: newConv.id,
      title: newConv.title,
      messages: [{ ...welcomeMessage, id: welcomeId }],
      createdAt: new Date(newConv.created_at),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, []);

  const addMessage = useCallback((convId: string, message: ChatMessage) => {
    // Don't persist streaming placeholders
    const shouldPersist = !message.isStreaming;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const isFirstUser =
          c.messages.filter((m) => m.role === "user").length === 0 &&
          message.role === "user";
        const newTitle = isFirstUser
          ? message.content.slice(0, 40) +
            (message.content.length > 40 ? "..." : "")
          : c.title;

        // Update title in DB if changed
        if (isFirstUser) {
          supabase
            .from("conversations")
            .update({ title: newTitle, updated_at: new Date().toISOString() })
            .eq("id", convId)
            .then();
        }

        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, message],
        };
      })
    );

    if (shouldPersist) {
      supabase
        .from("messages")
        .insert({
          id: message.id,
          conversation_id: convId,
          role: message.role,
          content: message.content,
          action: message.action || null,
        })
        .then();
    }
  }, []);

  const updateLastAssistantMessage = useCallback(
    (convId: string, content: string, isStreaming: boolean) => {
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

      // When streaming is done, persist the final message
      if (!isStreaming && content) {
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === convId);
          if (!conv) return prev;
          const lastMsg = conv.messages[conv.messages.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            supabase
              .from("messages")
              .insert({
                id: lastMsg.id,
                conversation_id: convId,
                role: "assistant",
                content,
                action: lastMsg.action || null,
              })
              .then();
          }
          return prev;
        });
      }
    },
    []
  );

  const setMessageAction = useCallback(
    (convId: string, messageId: string, action: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, action } : m
            ),
          };
        })
      );

      // Update in DB
      supabase
        .from("messages")
        .update({ action })
        .eq("id", messageId)
        .then();
    },
    []
  );

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    setMessageAction,
    loaded,
  };
}
