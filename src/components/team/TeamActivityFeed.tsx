import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, GitBranch, FileText, MessageSquare } from "lucide-react";
import type { TeamActivity } from "@/hooks/useTeam";

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

function getAvatarColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const entityIcons: Record<string, typeof Users> = {
  member: Users,
  lead: FileText,
  email: Mail,
  workflow: GitBranch,
  conversation: MessageSquare,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface TeamActivityFeedProps {
  activity: TeamActivity[];
}

export function TeamActivityFeed({ activity }: TeamActivityFeedProps) {
  if (activity.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1">
      {activity.map((item) => {
        const Icon = entityIcons[item.entity_type] || FileText;
        return (
          <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors">
            <Avatar className="h-7 w-7 shrink-0 mt-0.5">
              <AvatarFallback className={`${getAvatarColor(item.user_id)} text-[9px] font-medium text-primary-foreground`}>
                {getInitials(item.profile?.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.profile?.display_name || "Unknown"}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>{" "}
                {item.entity_name && (
                  <span className="font-medium">{item.entity_name}</span>
                )}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground capitalize">{item.entity_type}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(item.created_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
