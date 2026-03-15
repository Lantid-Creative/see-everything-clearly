import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, MessageSquare, Activity } from "lucide-react";
import { useTeam } from "@/hooks/useTeam";
import { TeamMembers } from "./TeamMembers";
import { TeamChat } from "./TeamChat";
import { TeamActivityFeed } from "./TeamActivityFeed";
import { CreateTeamView } from "./CreateTeamView";

interface TeamPanelProps {
  onBack: () => void;
}

export function TeamPanel({ onBack }: TeamPanelProps) {
  const teamData = useTeam();
  const { team, loading } = teamData;
  const [tab, setTab] = useState("members");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading team...</p>
      </div>
    );
  }

  if (!team) {
    return <CreateTeamView onCreate={teamData.createTeam} onBack={onBack} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={onBack}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{team.name}</h1>
          <p className="text-xs text-muted-foreground">
            {teamData.members.length} member{teamData.members.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-card px-4 h-10">
          <TabsTrigger value="members" className="gap-1.5 text-xs data-[state=active]:text-primary">
            <Users className="h-3.5 w-3.5" />
            Members
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5 text-xs data-[state=active]:text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs data-[state=active]:text-primary">
            <Activity className="h-3.5 w-3.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="flex-1 mt-0 min-h-0 overflow-y-auto">
          <TeamMembers
            members={teamData.members}
            myRole={teamData.myRole}
            onInvite={teamData.inviteMember}
            onUpdateRole={teamData.updateMemberRole}
            onRemove={teamData.removeMember}
          />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 mt-0 min-h-0 flex flex-col">
          <TeamChat messages={teamData.messages} onSend={teamData.sendMessage} />
        </TabsContent>

        <TabsContent value="activity" className="flex-1 mt-0 min-h-0 overflow-y-auto">
          <TeamActivityFeed activity={teamData.activity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
