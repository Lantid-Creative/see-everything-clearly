import { useState, useCallback } from "react";
import { ArrowLeft, Plus, Play, Loader2, Sparkles, X, GripVertical, Mail, Bell, FileText, Calendar, Send, Shield, Check, AlertTriangle, RotateCw, CircleCheck, CircleX } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import { useWorkflow, type WorkflowNode } from "@/hooks/useWorkspaceData";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  calendar: Calendar,
  file: FileText,
  mail: Mail,
  bell: Bell,
};

interface WorkflowBuilderViewProps {
  onBack: () => void;
}

interface PermissionScope {
  id: string;
  label: string;
  description: string;
  icon: string;
  required: boolean;
  granted: boolean;
}

interface NodeResult {
  nodeId: string;
  status: "success" | "error";
  output: string;
  durationMs: number;
}

type NodeExecStatus = "idle" | "running" | "success" | "error";

export function WorkflowBuilderView({ onBack }: WorkflowBuilderViewProps) {
  const { nodes, setNodes: saveNodes, isDeployed, deploy, loaded } = useWorkflow();
  const isMobile = useIsMobile();
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissionScopes, setPermissionScopes] = useState<PermissionScope[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeExecStatus>>({});
  const [nodeOutputs, setNodeOutputs] = useState<Record<string, string>>({});
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "I've set up your automation workflow. Each node describes a step in plain English. You can edit any node, add new ones, or ask me to modify the flow." },
  ]);
  const { toast } = useToast();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const deriveScopes = (): PermissionScope[] => {
    const scopes: PermissionScope[] = [];
    const hasCalendar = nodes.some((n) => n.icon === "calendar");
    const hasMail = nodes.some((n) => n.icon === "mail");
    const hasSlides = nodes.some((n) => n.icon === "file");
    const hasSlack = nodes.some((n) => n.label.toLowerCase().includes("slack"));

    if (hasCalendar) scopes.push({ id: "calendar.read", label: "Google Calendar", description: "Read calendar events and booking notifications", icon: "calendar", required: true, granted: false });
    if (hasMail) {
      scopes.push({ id: "email.send", label: "Email (Send)", description: "Send emails on your behalf with attachments", icon: "mail", required: true, granted: false });
      scopes.push({ id: "email.read", label: "Email (Read)", description: "Read inbox to detect replies and thread context", icon: "mail", required: false, granted: false });
    }
    if (hasSlides) {
      scopes.push({ id: "drive.write", label: "Google Drive", description: "Create and store generated presentations", icon: "file", required: true, granted: false });
      scopes.push({ id: "research.web", label: "Web Research", description: "Search the web to enrich slide content", icon: "file", required: true, granted: false });
    }
    if (hasSlack) scopes.push({ id: "slack.post", label: "Slack (Post)", description: "Send messages and attachments to Slack channels", icon: "bell", required: true, granted: false });
    scopes.push({ id: "agent.autonomous", label: "Autonomous Execution", description: "Run this workflow without manual approval each time", icon: "bell", required: true, granted: false });
    return scopes;
  };

  const addNode = () => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: "action",
      label: "New Step",
      description: "Describe what this step should do",
      icon: "bell",
      connected: true,
    };
    saveNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    saveNodes(nodes.filter((n) => n.id !== id));
  };

  const startEdit = (id: string, desc: string) => {
    setEditingNode(id);
    setEditValue(desc);
  };

  const saveEdit = () => {
    if (!editingNode) return;
    saveNodes(nodes.map((n) => (n.id === editingNode ? { ...n, description: editValue } : n)));
    setEditingNode(null);
  };

  const handleDeployClick = () => {
    setPermissionScopes(deriveScopes());
    setShowPermissions(true);
  };

  const toggleScope = (id: string) => {
    setPermissionScopes((prev) => prev.map((s) => (s.id === id ? { ...s, granted: !s.granted } : s)));
  };

  const allRequiredGranted = permissionScopes.filter((s) => s.required).every((s) => s.granted);

  const confirmDeploy = () => {
    setShowPermissions(false);
    deploy();
    toast({ title: "Workflow deployed!", description: "All permissions granted. Your automation is now active." });
  };

  const executeWorkflow = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setNodeOutputs({});
    setExpandedOutput(null);

    // Set all nodes to idle first, then run sequentially
    const initialStatuses: Record<string, NodeExecStatus> = {};
    nodes.forEach((n) => (initialStatuses[n.id] = "idle"));
    setNodeStatuses(initialStatuses);

    // Animate: set first node to running
    if (nodes.length > 0) {
      setNodeStatuses((prev) => ({ ...prev, [nodes[0].id]: "running" }));
    }

    try {
      const { data, error } = await supabase.functions.invoke("execute-workflow", {
        body: {
          workflowId: nodes[0]?.id ? "current" : "",
          nodes,
        },
      });

      if (error) throw error;

      const results: NodeResult[] = data?.results || [];

      // Animate results sequentially
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        await new Promise((r) => setTimeout(r, 400));

        setNodeStatuses((prev) => ({
          ...prev,
          [result.nodeId]: result.status,
          ...(i + 1 < nodes.length ? { [nodes[i + 1].id]: "running" } : {}),
        }));
        setNodeOutputs((prev) => ({ ...prev, [result.nodeId]: result.output }));
      }

      const allSuccess = results.every((r) => r.status === "success");
      const totalTime = results.reduce((sum, r) => sum + r.durationMs, 0);

      toast({
        title: allSuccess ? "Workflow executed!" : "Workflow completed with errors",
        description: `${results.filter((r) => r.status === "success").length}/${results.length} steps completed in ${(totalTime / 1000).toFixed(1)}s`,
        variant: allSuccess ? "default" : "destructive",
      });

      // Add execution summary to chat
      const summary = results
        .map((r) => `${r.status === "success" ? "✅" : "❌"} ${nodes.find((n) => n.id === r.nodeId)?.label}: ${r.output.slice(0, 80)}...`)
        .join("\n");
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Workflow executed:**\n\n${summary}` },
      ]);
    } catch (err: any) {
      console.error("Workflow execution failed:", err);
      toast({
        title: "Execution failed",
        description: err.message || "Failed to execute workflow",
        variant: "destructive",
      });
      // Mark all running/idle as error
      setNodeStatuses((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          if (updated[key] === "running" || updated[key] === "idle") {
            updated[key] = "error";
          }
        }
        return updated;
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsLoading(true);

    const lower = chatInput.toLowerCase();
    if (lower.includes("slack") || lower.includes("ping")) {
      const slackNode: WorkflowNode = { id: Date.now().toString(), type: "action", label: "Slack Notification", description: "Ping me on Slack with the presentation attached", icon: "bell", connected: true };
      saveNodes([...nodes, slackNode]);
    }

    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    let fullContent = "";

    try {
      await streamChat({
        messages: [
          { role: "user", content: `You are Lantid helping build a workflow automation. Current nodes: ${nodes.map(n => n.description).join(" → ")}. User request: ${chatInput}. Respond concisely.` },
        ],
        onDelta: (chunk) => {
          fullContent += chunk;
          setChatMessages((prev) => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: "assistant", content: fullContent }; return msgs; });
        },
        onDone: () => {},
      });
    } catch {
      setChatMessages((prev) => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: "assistant", content: "I've updated the workflow based on your feedback." }; return msgs; });
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeBorderClass = (nodeId: string) => {
    const status = nodeStatuses[nodeId];
    if (status === "running") return "border-primary bg-primary/5 shadow-md shadow-primary/10";
    if (status === "success") return "border-success/50 bg-success/5";
    if (status === "error") return "border-destructive/50 bg-destructive/5";
    if (isDeployed) return "border-success/30 bg-success/5";
    return "border-border hover:border-primary/40 hover:shadow-md bg-background";
  };

  const getNodeStatusIcon = (nodeId: string) => {
    const status = nodeStatuses[nodeId];
    if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />;
    if (status === "success") return <CircleCheck className="h-3.5 w-3.5 text-success" />;
    if (status === "error") return <CircleX className="h-3.5 w-3.5 text-destructive" />;
    return null;
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
        <div className="flex items-center gap-2">
          {isDeployed && (
            <button
              onClick={executeWorkflow}
              disabled={isExecuting}
              className="h-8 px-4 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/10 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isExecuting ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Running...</>
              ) : (
                <><RotateCw className="h-3.5 w-3.5" />Run Now</>
              )}
            </button>
          )}
          <button onClick={handleDeployClick} disabled={isDeployed} className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {isDeployed ? <>Deployed</> : <><Play className="h-3.5 w-3.5" />Deploy Workflow</>}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col items-center">
          <div className="space-y-0 w-full max-w-lg">
            {nodes.map((node, i) => {
              const Icon = iconMap[node.icon] || Bell;
              const output = nodeOutputs[node.id];
              return (
                <div key={node.id}>
                  <div className={`group relative border-2 rounded-xl p-4 transition-all ${getNodeBorderClass(node.id)}`}>
                    {!isDeployed && !isExecuting && (
                      <button onClick={() => removeNode(node.id)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        {!isDeployed && !isExecuting && <GripVertical className="h-4 w-4 text-muted-foreground/40" />}
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          nodeStatuses[node.id] === "running"
                            ? "bg-primary/20 text-primary"
                            : nodeStatuses[node.id] === "success"
                            ? "bg-success/10 text-success"
                            : nodeStatuses[node.id] === "error"
                            ? "bg-destructive/10 text-destructive"
                            : node.type === "trigger"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-primary/10 text-primary"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{node.type}</span>
                          <span className="text-xs font-medium text-foreground">{node.label}</span>
                          {getNodeStatusIcon(node.id)}
                        </div>
                        {editingNode === node.id ? (
                          <input value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus className="w-full text-xs text-foreground mt-1 bg-transparent border-b border-primary focus:outline-none" />
                        ) : (
                          <p onClick={() => !isDeployed && !isExecuting && startEdit(node.id, node.description)} className={`text-xs text-muted-foreground mt-0.5 ${!isDeployed && !isExecuting ? "cursor-pointer hover:text-foreground" : ""}`}>
                            {node.description}
                          </p>
                        )}
                        {nodeStatuses[node.id] === "running" && (
                          <p className="text-[10px] text-primary mt-1 animate-pulse">Executing...</p>
                        )}
                      </div>
                    </div>

                    {/* Execution output */}
                    {output && (
                      <div className="mt-3 border-t pt-2">
                        <button
                          onClick={() => setExpandedOutput(expandedOutput === node.id ? null : node.id)}
                          className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedOutput === node.id ? "Hide output ▲" : "Show output ▼"}
                        </button>
                        {expandedOutput === node.id && (
                          <pre className="mt-1.5 text-[11px] text-foreground bg-muted/50 rounded-lg p-2.5 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                            {output}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                  {i < nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className={`w-0.5 h-6 transition-colors ${
                        nodeStatuses[node.id] === "success" ? "bg-success/50" : "bg-border"
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
            {!isDeployed && !isExecuting && (
              <div className="flex justify-center pt-2">
                <button onClick={addNode} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-4 py-2 transition-colors hover:border-primary/40">
                  <Plus className="h-3.5 w-3.5" />Add step
                </button>
              </div>
            )}
          </div>
        </div>

        {!isMobile && (
          <div className="w-[300px] border-l flex flex-col shrink-0">
            <div className="px-4 py-2.5 border-b flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Lantid</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "ml-6" : ""}>
                  <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {msg.content ? (
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    ) : (
                      <span className="inline-block w-1 h-3 bg-foreground/40 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChat()} placeholder="Modify the workflow..." disabled={isLoading || isExecuting} className="flex-1 text-xs bg-secondary rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50" />
                <button onClick={handleChat} disabled={!chatInput.trim() || isLoading || isExecuting} className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40">
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Dialog */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-base">Authorization Required</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Carson needs the following permissions to run this workflow autonomously.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            {permissionScopes.map((scope) => {
              const Icon = iconMap[scope.icon] || Bell;
              return (
                <button key={scope.id} onClick={() => toggleScope(scope.id)} className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${scope.granted ? "border-success bg-success/5" : "border-border hover:border-muted-foreground/30"}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${scope.granted ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {scope.granted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{scope.label}</span>
                      {scope.required && <span className="text-[9px] uppercase tracking-wider font-semibold text-destructive">Required</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{scope.description}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${scope.granted ? "border-success bg-success" : "border-muted-foreground/30"}`}>
                    {scope.granted && <Check className="h-3 w-3 text-success-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>

          {!allRequiredGranted && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>All required permissions must be granted before deployment.</span>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <button onClick={() => setShowPermissions(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button onClick={confirmDeploy} disabled={!allRequiredGranted} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors">
              <Shield className="h-3.5 w-3.5" />
              Authorize & Deploy
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
