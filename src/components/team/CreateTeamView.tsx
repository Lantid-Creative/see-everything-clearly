import { useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateTeamViewProps {
  onCreate: (name: string) => Promise<void>;
  onBack: () => void;
}

export function CreateTeamView({ onCreate, onBack }: CreateTeamViewProps) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await onCreate(name.trim());
    setCreating(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Create Your Team</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Collaborate with your team on leads, workflows, and more.
          </p>
        </div>
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={!name.trim() || creating} className="w-full">
            {creating ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </div>
    </div>
  );
}
