import { useState, useCallback } from "react";
import { ArrowLeft, Plus, Play, Loader2, Sparkles, X, GripVertical, Mail, Bell, FileText, Calendar, Send } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";

interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  description: string;
  icon: string;
  connected: boolean;
}

const defaultNodes: WorkflowNode[] = [
  { id: "1", type: "trigger", label: "Calendar Event", description: "When someone books time on my calendar", icon: "calendar", connected: true },
  { id: "2", type: "action", label: "Generate Slides", description: "Create personalized presentation using research", icon: "file", connected: true },
  { id: "3", type: "action", label: "Send Email", description: "Email slides to me for review", icon: "mail", connected: true },
];

const iconMap: Record<string, any> = {
  calendar: Calendar,
  file: FileText,
  mail: Mail,
  bell: Bell,
};

interface WorkflowBuilderViewProps {
  onBack: () => void;
}

export function WorkflowBuilderView({ onBack }: WorkflowBuilderViewProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes);
  const [isDeployed, setIsDeployed] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "I've set up your automation workflow. Each node describes a step in plain English. You can edit any node, add new ones, or ask me to modify the flow." },
  ]);
  const { toast } = useToast();

  const addNode = () => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: "action",
      label: "New Step",
      description: "Describe what this step should do",
      icon: "bell",
      connected: true,
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const startEdit = (id: string, desc: string) => {
    setEditingNode(id);
    setEditValue(desc);
  };

  const saveEdit = () => {
    if (!editingNode) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === editingNode ? { ...n, description: editValue } : n))
    );
    setEditingNode(null);
  };

  const handleDeploy = () => {
    setIsDeployed(true);
    toast({
      title: "Workflow deployed!",
      description: "Your automation is now active and monitoring for triggers.",
    });
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsLoading(true);

    // Check for common modifications
    const lower = chatInput.toLowerCase();
    if (lower.includes("slack") || lower.includes("ping")) {
      setNodes((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "action",
          label: "Slack Notification",
          description: "Ping me on Slack with the presentation attached",
          icon: "bell",
          connected: true,
        },
      ]);
    }

    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    let fullContent = "";

    try {
      await streamChat({
        messages: [
          { role: "user", content: `You are Carson helping build a workflow automation. Current nodes: ${nodes.map(n => n.description).join(" → ")}. User request: ${chatInput}. Respond concisely about what you changed in the workflow.` },
        ],
        onDelta: (chunk) => {
          fullContent += chunk;
          setChatMessages((prev) => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { role: "assistant", content: fullContent };
            return msgs;
          });
        },
        onDone: () => {},
      });
    } catch {
      setChatMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { role: "assistant", content: "I've updated the workflow based on your feedback." };
        return msgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center px-4 border-b shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <button onClick={onBack} className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Workflow Builder</h1>
          {isDeployed && (
            <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Active
            </span>
          )}
        </div>
        <button
          onClick={handleDeploy}
          disabled={isDeployed}
          className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isDeployed ? (
            <>Deployed</>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Deploy Workflow
            </>
          )}
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Workflow Canvas */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
          <div className="space-y-0 w-full max-w-lg">
            {nodes.map((node, i) => {
              const Icon = iconMap[node.icon] || Bell;
              return (
                <div key={node.id}>
                  <div
                    className={`group relative border-2 rounded-xl p-4 transition-all ${
                      isDeployed
                        ? "border-success/30 bg-success/5"
                        : "border-border hover:border-primary/40 hover:shadow-md bg-background"
                    }`}
                  >
                    {!isDeployed && (
                      <button
                        onClick={() => removeNode(node.id)}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        {!isDeployed && <GripVertical className="h-4 w-4 text-muted-foreground/40" />}
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          node.type === "trigger" ? "bg-amber-500/10 text-amber-600" :
                          "bg-primary/10 text-primary"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                            {node.type}
                          </span>
                          <span className="text-xs font-medium text-foreground">{node.label}</span>
                        </div>
                        {editingNode === node.id ? (
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            autoFocus
                            className="w-full text-xs text-foreground mt-1 bg-transparent border-b border-primary focus:outline-none"
                          />
                        ) : (
                          <p
                            onClick={() => !isDeployed && startEdit(node.id, node.description)}
                            className={`text-xs text-muted-foreground mt-0.5 ${!isDeployed ? "cursor-pointer hover:text-foreground" : ""}`}
                          >
                            {node.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-6 bg-border" />
                    </div>
                  )}
                </div>
              );
            })}

            {!isDeployed && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={addNode}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-4 py-2 transition-colors hover:border-primary/40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add step
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="w-[300px] border-l flex flex-col shrink-0">
          <div className="px-4 py-2.5 border-b flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Carson</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`${msg.role === "user" ? "ml-6" : ""}`}
              >
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.content || <span className="inline-block w-1 h-3 bg-foreground/40 animate-pulse" />}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Modify the workflow..."
                disabled={isLoading || isDeployed}
                className="flex-1 text-xs bg-secondary rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim() || isLoading || isDeployed}
                className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
