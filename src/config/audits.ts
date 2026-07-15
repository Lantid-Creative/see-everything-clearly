// Central config for Lantid audit services.
// Pricing is UNIFORM across every audit: ₦250k / ₦500k / ₦1.5M base + 7.5% VAT.
// VAT is added at checkout — displayed clearly to the user.

import { ShieldCheck, Scale, FileLock2, Landmark, Fingerprint } from "lucide-react";

export const VAT_RATE = 0.075;

export const withVat = (baseKobo: number) => ({
  baseKobo,
  vatKobo: Math.round(baseKobo * VAT_RATE),
  totalKobo: baseKobo + Math.round(baseKobo * VAT_RATE),
});

export type TierKey = "standard" | "priority" | "expedited";

export const TIERS: Record<TierKey, {
  label: string;
  baseKobo: number;
  priceLabel: string;
  turnaround: string;
  blurb: string;
  highlighted?: boolean;
}> = {
  standard: {
    label: "Standard",
    baseKobo: 25_000_000, // ₦250,000
    priceLabel: "₦250,000",
    turnaround: "3 business days",
    blurb: "Full audit delivered within 3 business days.",
  },
  priority: {
    label: "Priority",
    baseKobo: 50_000_000, // ₦500,000
    priceLabel: "₦500,000",
    turnaround: "24 hours",
    blurb: "Same audit — expedited into a 24-hour window.",
    highlighted: true,
  },
  expedited: {
    label: "Expedited",
    baseKobo: 150_000_000, // ₦1,500,000
    priceLabel: "₦1,500,000",
    turnaround: "6 hours",
    blurb: "Rush audit with dedicated lead auditor & 6-hour turnaround.",
  },
};

export const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

export type IntakeField = {
  name: string;
  label: string;
  type: "text" | "email" | "url" | "textarea" | "select" | "number";
  required?: boolean;
  placeholder?: string;
  helper?: string;
  options?: string[];
  colSpan?: 1 | 2;
};

export type IntakeSection = { title: string; description?: string; fields: IntakeField[] };

export type AuditServiceDef = {
  slug: string;               // URL slug
  dbType: "aml_cft" | "iso_27001" | "ndpr" | "pci_dss" | "vapt";
  route: string;              // internal route
  external?: boolean;         // if true, use external route (existing pages)
  icon: typeof ShieldCheck;
  name: string;
  short: string;              // hub card blurb
  standard: string;           // regulatory reference
  hero: string;
  outcomes: string[];
  sections?: IntakeSection[]; // undefined for external audits
};

export const AUDITS: AuditServiceDef[] = [
  {
    slug: "vapt",
    dbType: "vapt",
    route: "/vapt",
    external: true,
    icon: Fingerprint,
    name: "VAPT",
    short: "Vulnerability Assessment & Penetration Testing across web, API, mobile & network surfaces.",
    standard: "OWASP ASVS · NIST SP 800-115 · PTES",
    hero: "Adversarial testing across your web, API, mobile, and network estate — with prioritized, exploitable findings.",
    outcomes: [
      "Executive + technical report with CVSS scoring",
      "Reproduction steps and evidence for every finding",
      "Retest of remediated findings included",
    ],
  },
  {
    slug: "pci-dss",
    dbType: "pci_dss",
    route: "/pci-dss",
    external: true,
    icon: ShieldCheck,
    name: "PCI DSS",
    short: "PCI DSS v4.0.1 gap assessment, SAQ facilitation or RoC-ready audit for merchants & service providers.",
    standard: "PCI DSS v4.0.1",
    hero: "Cardholder data protection assessment aligned to PCI DSS v4.0.1.",
    outcomes: [
      "CDE scoping & data-flow diagrams",
      "SAQ / RoC evidence pack",
      "Remediation roadmap with control owners",
    ],
  },
  {
    slug: "aml-cft",
    dbType: "aml_cft",
    route: "/audits/aml-cft",
    icon: Scale,
    name: "AML / CFT Audit",
    short: "Independent Anti-Money Laundering and Counter-Financing of Terrorism audit for regulated institutions.",
    standard: "FATF · CBN AML/CFT/CPF · SCN · NFIU",
    hero: "Independent AML/CFT audit aligned to FATF Recommendations and CBN AML/CFT/CPF Regulations 2022 (as amended).",
    outcomes: [
      "Institutional risk assessment (ML/TF/PF)",
      "KYC/CDD, EDD, PEP, and sanctions screening review",
      "Transaction monitoring & SAR/CTR pipeline testing",
      "Regulator-ready audit report + remediation plan",
    ],
    sections: [
      {
        title: "Institution profile",
        fields: [
          { name: "legal_name", label: "Registered legal name", type: "text", required: true, colSpan: 2 },
          { name: "rc_number", label: "RC / CAC number", type: "text", required: true },
          { name: "regulator", label: "Primary regulator", type: "select", required: true, options: ["Central Bank of Nigeria (CBN)","SEC Nigeria","NAICOM","NFIU direct reporter","Other"] },
          { name: "license_type", label: "License type / category", type: "text", required: true, placeholder: "e.g. Commercial bank, MFB, BDC, PSB, Fintech PSSP, Asset manager, Insurer" },
          { name: "date_licensed", label: "Date licensed", type: "text", placeholder: "YYYY-MM" },
          { name: "num_branches", label: "Branches / offices", type: "number" },
          { name: "num_staff", label: "Total staff", type: "number" },
          { name: "num_customers", label: "Active customers", type: "number" },
        ],
      },
      {
        title: "AML/CFT program",
        fields: [
          { name: "mlro_name", label: "Chief Compliance Officer / MLRO", type: "text", required: true },
          { name: "mlro_email", label: "MLRO email", type: "email", required: true },
          { name: "policy_last_reviewed", label: "AML policy last reviewed", type: "text", placeholder: "YYYY-MM" },
          { name: "board_approved", label: "Board-approved AML/CFT policy?", type: "select", options: ["Yes","No","Under review"] },
          { name: "risk_assessment_date", label: "Last enterprise-wide risk assessment", type: "text", placeholder: "YYYY-MM" },
          { name: "screening_tool", label: "Sanctions / PEP screening tool", type: "text", placeholder: "e.g. Refinitiv World-Check, Dow Jones, in-house" },
          { name: "tm_tool", label: "Transaction monitoring system", type: "text", placeholder: "e.g. SAS AML, Actimize, in-house rules engine" },
          { name: "goaml_registered", label: "goAML registered with NFIU?", type: "select", options: ["Yes","No","In progress"] },
        ],
      },
      {
        title: "Volumes & exposure",
        fields: [
          { name: "monthly_transactions", label: "Avg monthly transaction volume (count)", type: "text", placeholder: "e.g. 1.2M" },
          { name: "monthly_value_ngn", label: "Avg monthly transaction value (₦)", type: "text", placeholder: "e.g. ₦45B" },
          { name: "cross_border_pct", label: "% cross-border activity", type: "text", placeholder: "e.g. 12%" },
          { name: "high_risk_customers", label: "High-risk customer segments served", type: "textarea", colSpan: 2, placeholder: "e.g. PEPs, NGOs/NPOs, correspondent banking, high-net-worth, crypto counterparties" },
          { name: "prior_sar_ctr", label: "SARs / CTRs filed in the last 12 months", type: "text", placeholder: "SARs: __ · CTRs: __" },
          { name: "regulatory_actions", label: "Regulatory actions / findings in last 24 months", type: "textarea", colSpan: 2, placeholder: "Fines, warning letters, MoUs — briefly" },
        ],
      },
      {
        title: "Audit context",
        fields: [
          { name: "audit_trigger", label: "Reason for this audit", type: "select", required: true, options: ["Annual independent audit (regulatory requirement)","Pre-regulator on-site examination","Post-inspection remediation","Onboarding to correspondent bank / partner","Board / Audit Committee request","Other"] },
          { name: "scope_period", label: "Period under review", type: "text", required: true, placeholder: "e.g. Jan – Dec 2025" },
          { name: "prior_auditor", label: "Previous AML auditor (if any)", type: "text" },
          { name: "notes", label: "Anything else we should know", type: "textarea", colSpan: 2 },
        ],
      },
    ],
  },
  {
    slug: "iso-27001",
    dbType: "iso_27001",
    route: "/audits/iso-27001",
    icon: FileLock2,
    name: "ISO/IEC 27001 Audit",
    short: "ISMS readiness, internal audit and Stage-1/Stage-2 preparation to ISO/IEC 27001:2022.",
    standard: "ISO/IEC 27001:2022 · ISO/IEC 27002:2022",
    hero: "Independent internal audit or readiness assessment against ISO/IEC 27001:2022 — 93 Annex A controls.",
    outcomes: [
      "Statement of Applicability (SoA) review",
      "Clause 4–10 conformance audit",
      "Annex A control testing across all 4 themes",
      "Non-conformity report + corrective action plan",
    ],
    sections: [
      {
        title: "Organisation",
        fields: [
          { name: "legal_name", label: "Legal entity", type: "text", required: true, colSpan: 2 },
          { name: "industry", label: "Industry", type: "text", required: true },
          { name: "hq_country", label: "Headquarters country", type: "text", required: true },
          { name: "other_locations", label: "Other locations in scope", type: "textarea", colSpan: 2 },
          { name: "employees", label: "Employees in ISMS scope", type: "number" },
          { name: "contractors", label: "Contractors / 3rd-party staff", type: "number" },
        ],
      },
      {
        title: "ISMS scope",
        fields: [
          { name: "scope_statement", label: "ISMS scope statement", type: "textarea", required: true, colSpan: 2, placeholder: "Describe products, services, locations, and information systems inside the ISMS boundary." },
          { name: "certification_status", label: "Certification status", type: "select", required: true, options: ["Not certified — targeting first certification","Certified — surveillance audit","Certified — recertification","Certified against previous version (2013) — transitioning to 2022"] },
          { name: "target_certification_body", label: "Target certification body", type: "text", placeholder: "e.g. BSI, DNV, TÜV, DQS" },
          { name: "target_stage1_date", label: "Target Stage-1 date", type: "text", placeholder: "YYYY-MM" },
          { name: "soa_version", label: "Current SoA version / date", type: "text" },
          { name: "risk_methodology", label: "Risk assessment methodology", type: "text", placeholder: "e.g. ISO 27005, NIST SP 800-30, proprietary" },
        ],
      },
      {
        title: "Controls & operations",
        fields: [
          { name: "cloud_providers", label: "Cloud & hosting providers", type: "textarea", colSpan: 2, placeholder: "e.g. AWS eu-west-1, Azure UK South, on-prem DC in Lagos" },
          { name: "critical_apps", label: "Business-critical applications", type: "textarea", colSpan: 2 },
          { name: "data_classifications", label: "Data classification tiers in use", type: "text", placeholder: "e.g. Public / Internal / Confidential / Restricted" },
          { name: "incidents_12mo", label: "Security incidents in last 12 months", type: "text", placeholder: "count + brief nature" },
          { name: "last_internal_audit", label: "Last internal ISMS audit", type: "text", placeholder: "YYYY-MM" },
          { name: "last_mgmt_review", label: "Last management review", type: "text", placeholder: "YYYY-MM" },
          { name: "excluded_controls", label: "Annex A controls excluded (with justification)", type: "textarea", colSpan: 2 },
        ],
      },
      {
        title: "Engagement",
        fields: [
          { name: "audit_type", label: "Audit type requested", type: "select", required: true, options: ["Readiness / gap assessment","Internal audit (Clause 9.2)","Pre-certification mock audit","Post-audit remediation review"] },
          { name: "notes", label: "Additional context", type: "textarea", colSpan: 2 },
        ],
      },
    ],
  },
  {
    slug: "ndpr",
    dbType: "ndpr",
    route: "/audits/ndpr",
    icon: Landmark,
    name: "NDPR / NDPA Audit",
    short: "Nigeria Data Protection Act audit and NDPR compliance filing for data controllers & processors.",
    standard: "NDPA 2023 · NDPR 2019 · NDPR Implementation Framework",
    hero: "Data Protection Compliance Audit aligned to the Nigeria Data Protection Act 2023 and NDPR — required annually for data controllers of major importance.",
    outcomes: [
      "Data inventory & lawful basis mapping",
      "DPIA review, DSR pipeline & breach playbook testing",
      "Cross-border transfer & processor contract review",
      "NDPC audit filing package (Data Controller of Major Importance)",
    ],
    sections: [
      {
        title: "Data controller profile",
        fields: [
          { name: "legal_name", label: "Registered legal name", type: "text", required: true, colSpan: 2 },
          { name: "rc_number", label: "RC / CAC number", type: "text", required: true },
          { name: "sector", label: "Sector", type: "select", required: true, options: ["Financial services","Health","Telecoms / ISP","Education","Public sector","E-commerce / retail","Technology / SaaS","Insurance","Other"] },
          { name: "dcmi_status", label: "Data Controller of Major Importance (DCMI)?", type: "select", required: true, options: ["Yes — registered with NDPC","Yes — not yet registered","No","Not sure"] },
          { name: "dpo_name", label: "Data Protection Officer (DPO)", type: "text", required: true },
          { name: "dpo_email", label: "DPO email", type: "email", required: true },
          { name: "dpco_licensed", label: "Engaged a licensed DPCO?", type: "select", options: ["Yes","No","In procurement"] },
        ],
      },
      {
        title: "Data processing",
        fields: [
          { name: "data_subjects_count", label: "Approx. Nigerian data subjects held", type: "text", required: true, placeholder: "e.g. 1.2M" },
          { name: "sensitive_categories", label: "Sensitive personal data processed", type: "textarea", colSpan: 2, placeholder: "e.g. health, biometrics, financial, children, religious beliefs" },
          { name: "lawful_bases", label: "Lawful bases relied on", type: "textarea", colSpan: 2, placeholder: "consent, contract, legal obligation, vital interests, public interest, legitimate interest" },
          { name: "processors_count", label: "Number of data processors / sub-processors", type: "number" },
          { name: "cross_border", label: "Cross-border data transfers?", type: "select", required: true, options: ["No","Yes — adequacy country only","Yes — SCCs / BCRs","Yes — consent-based","Yes — other"] },
          { name: "cross_border_countries", label: "Destination countries", type: "text", placeholder: "e.g. Ireland, USA, India" },
        ],
      },
      {
        title: "Governance & incidents",
        fields: [
          { name: "privacy_policy_url", label: "Public privacy policy URL", type: "url" },
          { name: "last_audit_date", label: "Last data protection audit filed", type: "text", placeholder: "YYYY-MM" },
          { name: "dpia_count_12mo", label: "DPIAs conducted in last 12 months", type: "number" },
          { name: "dsr_volume_12mo", label: "Data subject requests handled (12mo)", type: "text", placeholder: "access / erasure / rectification / objection" },
          { name: "breaches_12mo", label: "Notifiable breaches in last 12 months", type: "text", placeholder: "count + nature" },
          { name: "breach_notification_sla", label: "Internal breach notification SLA", type: "text", placeholder: "e.g. 72h to NDPC, 24h internal" },
        ],
      },
      {
        title: "Engagement",
        fields: [
          { name: "audit_trigger", label: "Reason for audit", type: "select", required: true, options: ["Annual NDPR compliance audit (DCMI filing)","NDPC enforcement / investigation response","Pre-onboarding due diligence","M&A / fundraising diligence","Internal assurance","Other"] },
          { name: "scope_period", label: "Period under review", type: "text", required: true, placeholder: "e.g. Jan – Dec 2025" },
          { name: "notes", label: "Additional context", type: "textarea", colSpan: 2 },
        ],
      },
    ],
  },
];

export const auditBySlug = (slug: string) => AUDITS.find((a) => a.slug === slug);
