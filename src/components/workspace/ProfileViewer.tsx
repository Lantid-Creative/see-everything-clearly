import { Briefcase, ExternalLink } from "lucide-react";
import type { Lead } from "@/components/WorkspaceView";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileViewerProps {
  lead: Lead;
}

export function ProfileViewer({ lead }: ProfileViewerProps) {
  return (
    <div className="flex-1 md:border-r flex flex-col md:min-w-[260px] min-w-0 overflow-y-auto">
      <div className="px-4 py-2.5 border-b">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Profile</h2>
      </div>
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="text-center">
          <Avatar className="h-16 w-16 mx-auto">
            <AvatarFallback className="bg-blue-500 text-lg font-semibold text-primary-foreground">
              {lead.avatar}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-2 text-sm font-semibold text-foreground">{lead.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Building {lead.company}
          </p>
          {lead.linkedin && (
            <div className="flex items-center justify-center gap-3 mt-2">
              <a className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                LinkedIn <ExternalLink className="h-2.5 w-2.5" />
              </a>
              <a className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                Website <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>

        {/* Company Overview */}
        {lead.companyOverview && (
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Company Overview
            </h4>
            <p className="text-xs text-foreground leading-relaxed">{lead.companyOverview}</p>
          </div>
        )}

        {/* About */}
        {lead.about && (
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              About
            </h4>
            <p className="text-xs text-foreground leading-relaxed">{lead.about}</p>
          </div>
        )}

        {/* Personal Interests */}
        {lead.personalInterests && (
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Personal Interests
            </h4>
            <ul className="space-y-1">
              {lead.personalInterests.map((interest, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="text-muted-foreground mt-1">•</span>
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Experience */}
        {lead.experience && (
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Experience
            </h4>
            <div className="space-y-3">
              {lead.experience.map((exp, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{exp.role}</p>
                    <p className="text-[10px] text-muted-foreground">{exp.company}</p>
                    <p className="text-[10px] text-muted-foreground">{exp.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {lead.recentActivity && (
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Recent Activity
            </h4>
            <ul className="space-y-1.5">
              {lead.recentActivity.map((activity, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="text-muted-foreground mt-1">•</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
