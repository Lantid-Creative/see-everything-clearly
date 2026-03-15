import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FileAttachment } from "@/hooks/useFileUpload";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
  isStreaming?: boolean;
  attachments?: FileAttachment[];
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
    "Hey! 👋 I'm **Lantid**, your AI product management assistant. I help PMs figure out **what to build and why**.\n\nHere's what I can help you with:\n- 🔍 **Product Discovery** — research users, validate ideas, run interviews\n- 📋 **PRDs & Specs** — generate requirements, user stories, dev tasks\n- 📊 **Prioritization** — RICE scoring, trade-off analysis, roadmapping\n- ⚡ **Workflows** — automate repetitive PM processes\n- 📧 **Outreach** — draft stakeholder updates & customer emails\n\nTry one of the suggestions below to get started, or just ask me anything!",
};

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data: convRows } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (!convRows || convRows.length === 0) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ title: "Untitled", user_id: user!.id })
          .select()
          .single();

        if (newConv) {
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
              attachments: (m.attachments as unknown as FileAttachment[] | null) || undefined,
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
  }, [user]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0] ||
    { id: "", title: "Untitled", messages: [], createdAt: new Date() };

  const createConversation = useCallback(async () => {
    if (!user) return "";

    const { data: newConv } = await supabase
      .from("conversations")
      .insert({ title: "Untitled", user_id: user.id })
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
  }, [user]);

  const addMessage = useCallback((convId: string, message: ChatMessage) => {
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
          attachments: (message.attachments as any) || null,
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

      supabase
        .from("messages")
        .update({ action })
        .eq("id", messageId)
        .then();
    },
    []
  );

  const deleteConversation = useCallback(
    async (convId: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        const remaining = conversations.filter((c) => c.id !== convId);
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          // Create a new one if all deleted
          await createConversation();
        }
      }
      await supabase.from("conversations").delete().eq("id", convId);
    },
    [activeConversationId, conversations, createConversation]
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
    deleteConversation,
    loaded,
  };
}
