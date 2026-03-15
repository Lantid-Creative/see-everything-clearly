import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, MoreHorizontal, Shield, Crown, Eye, User, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { TeamMember } from "@/hooks/useTeam";

const roleIcons: Record<string, typeof User> = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const roleColors: Record<string, string> = {
  owner: "text-amber-500",
  admin: "text-primary",
  member: "text-muted-foreground",
  viewer: "text-muted-foreground",
};

const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
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

interface TeamMembersProps {
  members: TeamMember[];
  myRole: TeamMember["role"] | null;
  onInvite: (email: string, role: TeamMember["role"]) => Promise<void>;
  onUpdateRole: (memberId: string, role: TeamMember["role"]) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

export function TeamMembers({ members, myRole, onInvite, onUpdateRole, onRemove }: TeamMembersProps) {
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("member");
  const [inviting, setInviting] = useState(false);
  const isAdmin = myRole === "owner" || myRole === "admin";

  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    await onInvite(email.trim(), inviteRole);
    setEmail("");
    setInviting(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Invite form */}
      {isAdmin && (
        <div className="flex gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Invite by email..."
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamMember["role"])}>
            <SelectTrigger className="w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleInvite} disabled={!email.trim() || inviting}>
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-1">
        {members.map((member) => {
          const RoleIcon = roleIcons[member.role] || User;
          return (
            <div
              key={member.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={`${getAvatarColor(member.user_id)} text-xs font-medium text-primary-foreground`}>
                  {getInitials(member.profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.profile?.display_name || "Unknown"}
                </p>
                <div className="flex items-center gap-1">
                  <RoleIcon className={`h-3 w-3 ${roleColors[member.role]}`} />
                  <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                </div>
              </div>
              {isAdmin && member.role !== "owner" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent transition-all">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdateRole(member.id, "admin")}>
                      <Shield className="h-3.5 w-3.5 mr-2" /> Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateRole(member.id, "member")}>
                      <User className="h-3.5 w-3.5 mr-2" /> Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateRole(member.id, "viewer")}>
                      <Eye className="h-3.5 w-3.5 mr-2" /> Make Viewer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRemove(member.id)} className="text-destructive">
                      <X className="h-3.5 w-3.5 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
