import { useEffect } from "react";
import type { ViewMode } from "@/pages/Index";

interface UseKeyboardShortcutsProps {
  onNavigate: (view: ViewMode) => void;
  onNewChat: () => void;
  onToggleSearch: () => void;
}

export function useKeyboardShortcuts({
  onNavigate,
  onNewChat,
  onToggleSearch,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCmd = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Cmd+K — Global search (works even in inputs)
      if (isCmd && e.key === "k") {
        e.preventDefault();
        onToggleSearch();
        return;
      }

      // Cmd+N — New chat
      if (isCmd && e.key === "n") {
        e.preventDefault();
        onNewChat();
        return;
      }

      // Don't capture number shortcuts when in inputs
      if (isInput) return;

      if (isCmd && e.key >= "1" && e.key <= "7") {
        e.preventDefault();
        const viewMap: Record<string, ViewMode> = {
          "1": "dashboard",
          "2": "chat",
          "3": "workspace",
          "4": "workflow",
          "5": "slides",
          "6": "spreadsheet",
          "7": "team",
        };
        const view = viewMap[e.key];
        if (view) onNavigate(view);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate, onNewChat, onToggleSearch]);
}
