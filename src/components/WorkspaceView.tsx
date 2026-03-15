import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { EmailComposer } from "@/components/workspace/EmailComposer";
import { ProfileViewer } from "@/components/workspace/ProfileViewer";
import { ResearchPanel } from "@/components/workspace/ResearchPanel";
import { OutreachList } from "@/components/workspace/OutreachList";
import { useToast } from "@/hooks/use-toast";

export interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  avatar: string;
  linkedin?: string;
  about?: string;
  experience?: { role: string; company: string; period: string }[];
  recentActivity?: string[];
  companyOverview?: string;
  personalInterests?: string[];
  sent?: boolean;
}

const initialLeads: Lead[] = [
  {
    id: "1",
    name: "Zinny Weli",
    company: "RoboDock",
    title: "Co-Founder & CEO",
    email: "zinny@robodock.com",
    avatar: "ZW",
    about: "Co-founder & CEO at RoboDock (YC W26). Previously senior mechanical design engineer at Zipline and product design engineer at Amazon Lab126. Stanford MS in Mechanical Engineering, University of Michigan BS summa cum laude. Passionate about robotics and building hardware that scales.",
    companyOverview: "RoboDock (YC W26) automates AV and EV fleet depots — robotic charging, automated vehicle inspections via vision + thermal sensors, and self-optimizing depot operations. Targets $900k/yr in charging labor costs per depot. Retrofit approach: deploys into existing depots with zero layout changes. Co-developed with AV operators. AV depot market growing from ~$200B to ~$3T by 2035.",
    experience: [
      { role: "Co-Founder & CEO", company: "RoboDock (YC W26)", period: "Nov 2025 – Present" },
      { role: "Senior Mechanical Design Engineer", company: "Zipline", period: "Jan 2024 – Aug 2025 · 1 yr 8 mos" },
      { role: "Product Design Engineer", company: "Amazon Lab126", period: "Jun 2020 – Jan 2024 · 3 yrs 7 mos" },
    ],
    recentActivity: [
      "Accepted into Y Combinator W26 batch with RoboDock",
      "Completed FFC AI Cohort at Pear VC",
      "Transitioned from Zipline to found RoboDock full-time",
    ],
    personalInterests: ["Self-described engineer, designer, and traveler"],
  },
  {
    id: "2", name: "Alberto Rosas", company: "Draft", title: "Founder",
    email: "alberto@draft.dev", avatar: "AR",
    about: "Founder of Draft, a developer content platform. Previously engineer at major tech companies.",
    companyOverview: "Draft helps companies create high-quality technical blog content by connecting them with experienced developer writers.",
  },
  {
    id: "3", name: "Amit Yadav", company: "Inter Labs", title: "CEO",
    email: "amit@interlabs.ai", avatar: "AY",
    about: "CEO at Inter Labs, building next-generation AI infrastructure.",
    companyOverview: "Inter Labs develops AI-powered tools for enterprise automation and data processing.",
  },
  {
    id: "4", name: "Oliviero Pinotti", company: "Tensai", title: "CTO",
    email: "oliviero@tensai.io", avatar: "OP",
    about: "CTO at Tensai, focused on machine learning infrastructure.",
    companyOverview: "Tensai builds ML infrastructure for real-time inference at scale.",
  },
  {
    id: "5", name: "Brianna Lin", company: "Gora", title: "Co-Founder",
    email: "brianna@gora.ai", avatar: "BL",
    about: "Co-Founder of Gora, working on decentralized AI oracles.",
    companyOverview: "Gora provides decentralized oracle solutions for AI model verification and data integrity.",
  },
  {
    id: "6", name: "Huzaifa Ahmad", company: "Hex Security", title: "Founder",
    email: "huzaifa@hexsec.io", avatar: "HA",
    about: "Founder of Hex Security, building enterprise-grade security tools.",
    companyOverview: "Hex Security offers AI-powered threat detection and response for cloud-native applications.",
  },
  {
    id: "7", name: "Zsika Phillip-Baptiste", company: "EquiPay", title: "CEO",
    email: "zsika@equipay.co", avatar: "ZP",
    about: "CEO of EquiPay, creating equitable payment solutions.",
    companyOverview: "EquiPay builds fair and transparent payroll software focused on pay equity analytics.",
  },
];

interface WorkspaceViewProps {
  onBack: () => void;
}

export function WorkspaceView({ onBack }: WorkspaceViewProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead>(leads[0]);
  const [chatInput, setChatInput] = useState("");
  const [workspaceChatMessages, setWorkspaceChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const { toast } = useToast();

  const sentCount = leads.filter((l) => l.sent).length;

  const handleSendEmail = (subject: string, body: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, sent: true } : l))
    );
    setSelectedLead((prev) => ({ ...prev, sent: true }));
    toast({
      title: "Email sent!",
      description: `Email to ${selectedLead.name} at ${selectedLead.email} has been queued.`,
    });

    // Auto-advance to next unsent lead
    const nextUnsent = leads.find((l) => !l.sent && l.id !== selectedLead.id);
    if (nextUnsent) {
      setTimeout(() => setSelectedLead(nextUnsent), 500);
    }
  };

  const handleWorkspaceChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setWorkspaceChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    // Simulated response
    setTimeout(() => {
      setWorkspaceChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Got it! I'll help you with "${chatInput}". Let me update the workspace accordingly.`,
        },
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <button
            onClick={onBack}
            className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Sales Outreach</h1>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {sentCount}/{leads.length} sent
          </span>
        </div>
      </header>

      {/* Workspace panels */}
      <div className="flex-1 flex min-h-0">
        <OutreachList
          leads={leads}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
        />
        <EmailComposer lead={selectedLead} onSend={handleSendEmail} />
        <ProfileViewer lead={selectedLead} />
        <ResearchPanel lead={selectedLead} chatMessages={workspaceChatMessages} />
      </div>

      {/* Bottom chat bar */}
      <div className="border-t px-4 py-2.5 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleWorkspaceChat()}
            placeholder="Reply..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={handleWorkspaceChat}
            disabled={!chatInput.trim()}
            className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
