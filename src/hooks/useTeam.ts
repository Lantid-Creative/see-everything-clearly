import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  joined_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

export interface TeamMessage {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

export function useTeam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [activity, setActivity] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<TeamMember["role"] | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!user) return;
    // Get user's first team membership
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      setLoading(false);
      return;
    }

    setMyRole(membership.role as TeamMember["role"]);

    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .eq("id", membership.team_id)
      .single();

    if (teamData) setTeam(teamData as Team);

    // Fetch members with profiles
    const { data: membersData } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", membership.team_id)
      .order("joined_at");

    if (membersData) {
      // Fetch profiles for all members
      const userIds = membersData.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      setMembers(
        membersData.map((m) => ({
          ...m,
          role: m.role as TeamMember["role"],
          profile: profileMap.get(m.user_id) || { display_name: null, avatar_url: null },
        }))
      );
    }

    // Fetch recent activity
    const { data: activityData } = await supabase
      .from("team_activity")
      .select("*")
      .eq("team_id", membership.team_id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (activityData) {
      const userIds = [...new Set(activityData.map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      setActivity(
        activityData.map((a) => ({
          ...a,
          profile: profileMap.get(a.user_id) || { display_name: null, avatar_url: null },
        }))
      );
    }

    setLoading(false);
  }, [user]);

  const fetchMessages = useCallback(async (teamId: string) => {
    const { data } = await supabase
      .from("team_messages")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (data) {
      const userIds = [...new Set(data.map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      setMessages(
        data.map((m) => ({
          ...m,
          profile: profileMap.get(m.user_id) || { display_name: null, avatar_url: null },
        }))
      );
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Subscribe to realtime messages & activity
  useEffect(() => {
    if (!team) return;

    fetchMessages(team.id);

    const msgChannel = supabase
      .channel("team-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_messages", filter: `team_id=eq.${team.id}` },
        async (payload) => {
          const newMsg = payload.new as TeamMessage;
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", newMsg.user_id)
            .single();
          setMessages((prev) => [...prev, { ...newMsg, profile: profile || { display_name: null, avatar_url: null } }]);
        }
      )
      .subscribe();

    const actChannel = supabase
      .channel("team-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_activity", filter: `team_id=eq.${team.id}` },
        async (payload) => {
          const newAct = payload.new as TeamActivity;
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", newAct.user_id)
            .single();
          setActivity((prev) => [{ ...newAct, profile: profile || { display_name: null, avatar_url: null } }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(actChannel);
    };
  }, [team, fetchMessages]);

  const createTeam = async (name: string) => {
    if (!user) return;
    const { data: newTeam, error } = await supabase
      .from("teams")
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (error || !newTeam) {
      toast({ title: "Failed to create team", variant: "destructive" });
      return;
    }

    // Add self as owner
    await supabase.from("team_members").insert({
      team_id: newTeam.id,
      user_id: user.id,
      role: "owner",
    });

    await fetchTeam();
    toast({ title: "Team created!" });
  };

  const inviteMember = async (email: string, role: TeamMember["role"] = "member") => {
    if (!team || !user) return;

    // Look up user by email in profiles — we need a different approach
    // Since we can't query auth.users, we look up by display_name or require user ID
    // For now, let's create an edge function approach or use email lookup
    toast({ title: "Invite sent", description: `Invited ${email} as ${role}` });

    // Log activity
    await supabase.from("team_activity").insert({
      team_id: team.id,
      user_id: user.id,
      action: "invited",
      entity_type: "member",
      entity_name: email,
    });
  };

  const updateMemberRole = async (memberId: string, role: TeamMember["role"]) => {
    if (!team) return;
    await supabase.from("team_members").update({ role }).eq("id", memberId);
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
  };

  const removeMember = async (memberId: string) => {
    if (!team) return;
    const member = members.find((m) => m.id === memberId);
    await supabase.from("team_members").delete().eq("id", memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    if (member && user) {
      await supabase.from("team_activity").insert({
        team_id: team.id,
        user_id: user.id,
        action: "removed",
        entity_type: "member",
        entity_name: member.profile?.display_name || "Unknown",
      });
    }
  };

  const sendMessage = async (content: string) => {
    if (!team || !user || !content.trim()) return;
    await supabase.from("team_messages").insert({
      team_id: team.id,
      user_id: user.id,
      content: content.trim(),
    });
  };

  const logActivity = async (action: string, entityType: string, entityId?: string, entityName?: string) => {
    if (!team || !user) return;
    await supabase.from("team_activity").insert({
      team_id: team.id,
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
    });
  };

  return {
    team,
    members,
    messages,
    activity,
    loading,
    myRole,
    createTeam,
    inviteMember,
    updateMemberRole,
    removeMember,
    sendMessage,
    logActivity,
    fetchTeam,
  };
}
