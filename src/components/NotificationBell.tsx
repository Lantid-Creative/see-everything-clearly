import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Users,
  Workflow,
  Sparkles,
  Clock,
  X,
} from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const typeIcon: Record<string, typeof Users> = {
  team_activity: Users,
  workflow: Workflow,
  info: Sparkles,
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-[100] w-[360px] max-h-[480px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Read all
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1"
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    You'll be notified when teammates take actions or workflows complete
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkRead={() => markAsRead(notif.id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const Icon = typeIcon[notification.type] || Sparkles;

  return (
    <button
      onClick={() => {
        if (!notification.read) onMarkRead();
      }}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30 ${
        !notification.read ? "bg-primary/[0.03]" : ""
      }`}
    >
      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
          !notification.read ? "bg-primary/10" : "bg-muted"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            !notification.read ? "text-primary" : "text-muted-foreground"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-tight ${
            !notification.read
              ? "font-medium text-foreground"
              : "text-foreground/70"
          }`}
        >
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {notification.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
        <span className="text-[10px] text-muted-foreground">
          {timeAgo(notification.created_at)}
        </span>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
        )}
      </div>
    </button>
  );
}
