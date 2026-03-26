import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lead } from "@/components/WorkspaceView";

interface SpreadsheetLead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  linkedin: string;
  status: "verified" | "pending" | "enriching";
  source: string;
}

export function useOutreachLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user!.id)
        .eq("lead_type", "outreach")
        .order("created_at", { ascending: true });

      setLeads((data || []).map(dbToLead));
      setLoaded(true);
    }
    load();
  }, [user]);

  const markSent = useCallback(async (leadId: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, sent: true } : l)));
    await supabase.from("leads").update({ sent: true, updated_at: new Date().toISOString() }).eq("id", leadId);
  }, []);

  const addLead = useCallback(async (lead: Omit<Lead, "id">) => {
    if (!user) return;
    const { data } = await supabase.from("leads").insert({
      user_id: user.id,
      lead_type: "outreach",
      name: lead.name,
      company: lead.company,
      title: lead.title,
      email: lead.email,
      avatar: lead.avatar || "",
      about: lead.about || "",
      company_overview: lead.companyOverview || "",
      personal_interests: lead.personalInterests || [],
      experience: lead.experience || [],
      recent_activity: lead.recentActivity || [],
      sent: false,
    }).select().single();
    if (data) {
      setLeads((prev) => [...prev, dbToLead(data)]);
    }
  }, [user]);

  return { leads, setLeads, loaded, markSent, addLead };
}

export function useSpreadsheetLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<SpreadsheetLead[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user!.id)
        .eq("lead_type", "spreadsheet")
        .order("created_at", { ascending: true });

      setLeads((data || []).map(dbToSpreadsheetLead));
      setLoaded(true);
    }
    load();
  }, [user]);

  const addLead = useCallback(async (lead: Omit<SpreadsheetLead, "id">) => {
    if (!user) return null;
    const { data } = await supabase.from("leads").insert({
      user_id: user.id,
      lead_type: "spreadsheet",
      name: lead.name,
      company: lead.company,
      title: lead.title,
      email: lead.email,
      linkedin: lead.linkedin,
      status: lead.status,
      source: lead.source,
    }).select().single();
    if (data) {
      const newLead = dbToSpreadsheetLead(data);
      setLeads((prev) => [...prev, newLead]);
      return newLead;
    }
    return null;
  }, [user]);

  const updateLead = useCallback(async (id: string, field: string, value: string) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
    await supabase.from("leads").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id);
  }, []);

  const deleteLeads = useCallback(async (ids: string[]) => {
    setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
    await supabase.from("leads").delete().in("id", ids);
  }, []);

  return { leads, setLeads, loaded, addLead, updateLead, deleteLeads };
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  description: string;
  icon: string;
  connected: boolean;
}

export function useWorkflow() {
  const { user } = useAuth();
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [isDeployed, setIsDeployed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setWorkflowId(data.id);
        setNodes((data.nodes as any) || []);
        setIsDeployed(data.is_deployed || false);
      }
      setLoaded(true);
    }
    load();
  }, [user]);

  const saveNodes = useCallback(async (newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
    if (workflowId) {
      await supabase.from("workflows").update({ nodes: newNodes as any, updated_at: new Date().toISOString() }).eq("id", workflowId);
    }
  }, [workflowId]);

  const createWorkflow = useCallback(async (name: string, workflowNodes: WorkflowNode[]) => {
    if (!user) return;
    const { data } = await supabase
      .from("workflows")
      .insert({ user_id: user.id, name, nodes: workflowNodes as any })
      .select()
      .single();
    if (data) {
      setWorkflowId(data.id);
      setNodes(workflowNodes);
      setIsDeployed(false);
    }
  }, [user]);

  const deploy = useCallback(async () => {
    setIsDeployed(true);
    if (workflowId) {
      await supabase.from("workflows").update({ is_deployed: true, updated_at: new Date().toISOString() }).eq("id", workflowId);
    }
  }, [workflowId]);

  return { nodes, setNodes: saveNodes, isDeployed, deploy, loaded, workflowId, createWorkflow };
}

// DB row → Lead type conversion
function dbToLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    title: row.title,
    email: row.email,
    avatar: row.avatar || row.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2),
    linkedin: row.linkedin,
    about: row.about,
    companyOverview: row.company_overview,
    personalInterests: row.personal_interests || [],
    experience: row.experience || [],
    recentActivity: row.recent_activity || [],
    sent: row.sent || false,
  };
}

function dbToSpreadsheetLead(row: any): SpreadsheetLead {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    title: row.title,
    email: row.email,
    linkedin: row.linkedin || "",
    status: (row.status as "verified" | "pending" | "enriching") || "verified",
    source: row.source || "",
  };
}
