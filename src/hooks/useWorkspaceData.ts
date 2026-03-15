import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lead } from "@/components/WorkspaceView";

const initialOutreachLeads: Omit<Lead, "id">[] = [
  {
    name: "Zinny Weli", company: "RoboDock", title: "Co-Founder & CEO", email: "zinny@robodock.com", avatar: "ZW",
    about: "Co-founder & CEO at RoboDock (YC W26). Previously senior mechanical design engineer at Zipline and product design engineer at Amazon Lab126.",
    companyOverview: "RoboDock (YC W26) automates AV and EV fleet depots — robotic charging, automated vehicle inspections via vision + thermal sensors.",
    experience: [
      { role: "Co-Founder & CEO", company: "RoboDock (YC W26)", period: "Nov 2025 – Present" },
      { role: "Senior Mechanical Design Engineer", company: "Zipline", period: "Jan 2024 – Aug 2025" },
      { role: "Product Design Engineer", company: "Amazon Lab126", period: "Jun 2020 – Jan 2024" },
    ],
    recentActivity: ["Accepted into Y Combinator W26 batch with RoboDock", "Completed FFC AI Cohort at Pear VC"],
    personalInterests: ["Self-described engineer, designer, and traveler"],
  },
  { name: "Alberto Rosas", company: "Draft", title: "Founder", email: "alberto@draft.dev", avatar: "AR", about: "Founder of Draft, a developer content platform.", companyOverview: "Draft helps companies create high-quality technical blog content.", personalInterests: ["Cycling enthusiast", "Open-source contributor"] },
  { name: "Amit Yadav", company: "Inter Labs", title: "CEO", email: "amit@interlabs.ai", avatar: "AY", about: "CEO at Inter Labs, building next-generation AI infrastructure.", companyOverview: "Inter Labs develops AI-powered tools for enterprise automation." },
  { name: "Oliviero Pinotti", company: "Tensai", title: "CTO", email: "oliviero@tensai.io", avatar: "OP", about: "CTO at Tensai, focused on machine learning infrastructure.", companyOverview: "Tensai builds ML infrastructure for real-time inference at scale." },
  { name: "Brianna Lin", company: "Gora", title: "Co-Founder", email: "brianna@gora.ai", avatar: "BL", about: "Co-Founder of Gora, working on decentralized AI oracles.", companyOverview: "Gora provides decentralized oracle solutions for AI verification." },
  { name: "Huzaifa Ahmad", company: "Hex Security", title: "Founder", email: "huzaifa@hexsec.io", avatar: "HA", about: "Founder of Hex Security, building enterprise-grade security tools.", companyOverview: "Hex Security offers AI-powered threat detection for cloud-native apps." },
  { name: "Zsika Phillip-Baptiste", company: "EquiPay", title: "CEO", email: "zsika@equipay.co", avatar: "ZP", about: "CEO of EquiPay, creating equitable payment solutions.", companyOverview: "EquiPay builds fair and transparent payroll software." },
];

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

const initialSpreadsheetLeads: Omit<SpreadsheetLead, "id">[] = [
  { name: "Zinny Weli", company: "RoboDock", title: "Co-Founder & CEO", email: "zinny@robodock.com", linkedin: "linkedin.com/in/zinnyweli", status: "verified", source: "YC W26 batch" },
  { name: "Alberto Rosas", company: "Draft", title: "Founder", email: "alberto@draft.dev", linkedin: "linkedin.com/in/albertorosas", status: "verified", source: "Tech blog" },
  { name: "Amit Yadav", company: "Inter Labs", title: "CEO", email: "amit@interlabs.ai", linkedin: "linkedin.com/in/amityadav", status: "verified", source: "Crunchbase" },
  { name: "Oliviero Pinotti", company: "Tensai", title: "CTO", email: "oliviero@tensai.io", linkedin: "linkedin.com/in/olivieropinotti", status: "verified", source: "AngelList" },
  { name: "Brianna Lin", company: "Gora", title: "Co-Founder", email: "brianna@gora.ai", linkedin: "linkedin.com/in/briannalin", status: "verified", source: "YC W26 batch" },
  { name: "Huzaifa Ahmad", company: "Hex Security", title: "Founder", email: "huzaifa@hexsec.io", linkedin: "linkedin.com/in/huzaifaahmad", status: "pending", source: "ProductHunt" },
  { name: "Zsika Phillip-Baptiste", company: "EquiPay", title: "CEO", email: "zsika@equipay.co", linkedin: "linkedin.com/in/zsikaphillip", status: "verified", source: "Crunchbase" },
  { name: "Priya Sharma", company: "DataWeave", title: "CTO", email: "priya@dataweave.ai", linkedin: "linkedin.com/in/priyasharma", status: "enriching", source: "Web research" },
  { name: "Marco Chen", company: "FlowStack", title: "Co-Founder", email: "marco@flowstack.io", linkedin: "linkedin.com/in/marcochen", status: "verified", source: "TechCrunch" },
  { name: "Aisha Johnson", company: "NeuroPath", title: "CEO", email: "aisha@neuropath.ai", linkedin: "linkedin.com/in/aishajohnson", status: "enriching", source: "Web research" },
  { name: "Liam O'Brien", company: "SecureEdge", title: "Founder", email: "liam@secureedge.io", linkedin: "linkedin.com/in/liamobrien", status: "verified", source: "AngelList" },
  { name: "Yuki Tanaka", company: "RoboSense", title: "CTO", email: "yuki@robosense.jp", linkedin: "linkedin.com/in/yukitanaka", status: "verified", source: "YC W26 batch" },
  { name: "Sofia Martinez", company: "CloudBridge", title: "VP Engineering", email: "sofia@cloudbridge.co", linkedin: "linkedin.com/in/sofiamartinez", status: "pending", source: "Crunchbase" },
  { name: "David Kim", company: "QuantumLeap", title: "Founder", email: "david@quantumleap.io", linkedin: "linkedin.com/in/davidkim", status: "verified", source: "Web research" },
  { name: "Elena Popov", company: "AIScale", title: "CEO", email: "elena@aiscale.ai", linkedin: "linkedin.com/in/elenapopov", status: "verified", source: "TechCrunch" },
];

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

      if (!data || data.length === 0) {
        // Seed default leads
        const inserts = initialOutreachLeads.map((l) => ({
          user_id: user!.id,
          lead_type: "outreach",
          name: l.name,
          company: l.company,
          title: l.title,
          email: l.email,
          avatar: l.avatar || "",
          about: l.about || "",
          company_overview: l.companyOverview || "",
          personal_interests: l.personalInterests || [],
          experience: l.experience || [],
          recent_activity: l.recentActivity || [],
          sent: false,
        }));
        const { data: seeded } = await supabase.from("leads").insert(inserts).select();
        if (seeded) {
          setLeads(seeded.map(dbToLead));
        }
      } else {
        setLeads(data.map(dbToLead));
      }
      setLoaded(true);
    }
    load();
  }, [user]);

  const markSent = useCallback(async (leadId: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, sent: true } : l)));
    await supabase.from("leads").update({ sent: true, updated_at: new Date().toISOString() }).eq("id", leadId);
  }, []);

  return { leads, setLeads, loaded, markSent };
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

      if (!data || data.length === 0) {
        const inserts = initialSpreadsheetLeads.map((l) => ({
          user_id: user!.id,
          lead_type: "spreadsheet",
          name: l.name,
          company: l.company,
          title: l.title,
          email: l.email,
          linkedin: l.linkedin,
          status: l.status,
          source: l.source,
        }));
        const { data: seeded } = await supabase.from("leads").insert(inserts).select();
        if (seeded) {
          setLeads(seeded.map(dbToSpreadsheetLead));
        }
      } else {
        setLeads(data.map(dbToSpreadsheetLead));
      }
      setLoaded(true);
    }
    load();
  }, [user]);

  return { leads, setLeads, loaded };
}

export interface WorkflowNode {
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

export function useWorkflow() {
  const { user } = useAuth();
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultNodes);
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
        .single();

      if (data) {
        setWorkflowId(data.id);
        setNodes((data.nodes as any) || defaultNodes);
        setIsDeployed(data.is_deployed || false);
      } else {
        // Create default workflow
        const { data: newWf } = await supabase
          .from("workflows")
          .insert({ user_id: user!.id, name: "Default Workflow", nodes: defaultNodes as any })
          .select()
          .single();
        if (newWf) {
          setWorkflowId(newWf.id);
        }
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

  const deploy = useCallback(async () => {
    setIsDeployed(true);
    if (workflowId) {
      await supabase.from("workflows").update({ is_deployed: true, updated_at: new Date().toISOString() }).eq("id", workflowId);
    }
  }, [workflowId]);

  return { nodes, setNodes: saveNodes, isDeployed, deploy, loaded, workflowId };
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
