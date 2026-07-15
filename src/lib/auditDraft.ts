export type AuditDraft = {
  tier: string;
  form: Record<string, string>;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  savedAt: number;
};

const key = (slug: string, userId: string) => `lantid:audit-draft:${slug}:${userId}`;

export const loadDraft = (slug: string, userId: string): AuditDraft | null => {
  try {
    const raw = localStorage.getItem(key(slug, userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuditDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveDraft = (slug: string, userId: string, draft: AuditDraft) => {
  try {
    localStorage.setItem(key(slug, userId), JSON.stringify(draft));
  } catch {
    // ignore quota / private-mode errors
  }
};

export const clearDraft = (slug: string, userId: string) => {
  try {
    localStorage.removeItem(key(slug, userId));
  } catch {
    // ignore
  }
};

export const draftIsMeaningful = (d: AuditDraft | null) => {
  if (!d) return false;
  if (d.companyName || d.contactName || d.contactPhone) return true;
  return Object.keys(d.form || {}).some((k) => (d.form[k] || "").length > 0);
};
