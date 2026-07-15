// Central config for Lantid audit services.
// Uniform pricing across every audit: ₦250k / ₦500k / ₦1.5M base + 7.5% VAT.

import {
  ShieldCheck, Scale, FileLock2, Landmark, Fingerprint, Building2, Network, BadgeCheck,
  Globe2, HeartPulse, Server, LifeBuoy, Cloud, Code2, Swords, Blocks, BrainCircuit,
  Truck, Smartphone, Siren,
} from "lucide-react";

export const VAT_RATE = 0.075;

export const withVat = (baseKobo: number) => ({
  baseKobo,
  vatKobo: Math.round(baseKobo * VAT_RATE),
  totalKobo: baseKobo + Math.round(baseKobo * VAT_RATE),
});

export type TierKey = "standard" | "priority" | "expedited";

export const TIERS: Record<TierKey, {
  label: string; baseKobo: number; priceLabel: string; turnaround: string; blurb: string; highlighted?: boolean;
}> = {
  standard:  { label: "Standard",  baseKobo: 25_000_000,  priceLabel: "₦250,000",   turnaround: "3 business days", blurb: "Full audit delivered within 3 business days." },
  priority:  { label: "Priority",  baseKobo: 50_000_000,  priceLabel: "₦500,000",   turnaround: "24 hours",        blurb: "Same audit — expedited into a 24-hour window.", highlighted: true },
  expedited: { label: "Expedited", baseKobo: 150_000_000, priceLabel: "₦1,500,000", turnaround: "6 hours",         blurb: "Rush audit with dedicated lead auditor & 6-hour turnaround." },
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

export type AuditDbType =
  | "aml_cft" | "iso_27001" | "ndpr" | "pci_dss" | "vapt"
  | "cbn_rcsf" | "swift_csp" | "soc_2" | "ndic"
  | "gdpr" | "hipaa" | "nitda_grc" | "iso_22301"
  | "cloud_config" | "source_code" | "red_team" | "blockchain"
  | "iso_42001" | "vendor_risk" | "mobile_masvs" | "dfir";

export type AuditServiceDef = {
  slug: string;
  dbType: AuditDbType;
  route: string;
  external?: boolean;
  icon: typeof ShieldCheck;
  name: string;
  short: string;
  standard: string;
  hero: string;
  outcomes: string[];
  category?: "financial" | "governance" | "technical" | "specialty" | "core";
  sections?: IntakeSection[];
};

// Reusable section builders
const orgContactSection: IntakeSection = {
  title: "Organisation",
  fields: [
    { name: "legal_name", label: "Registered legal name", type: "text", required: true, colSpan: 2 },
    { name: "industry", label: "Industry / sector", type: "text", required: true },
    { name: "hq_country", label: "Headquarters country", type: "text", required: true },
    { name: "employees", label: "Employees in scope", type: "number" },
    { name: "revenue_bracket", label: "Annual revenue bracket", type: "select", options: ["< ₦500M","₦500M – ₦5B","₦5B – ₦50B","> ₦50B","Prefer not to say"] },
  ],
};

const engagementSection = (triggers: string[]): IntakeSection => ({
  title: "Engagement context",
  fields: [
    { name: "audit_trigger", label: "Reason for this audit", type: "select", required: true, options: triggers },
    { name: "scope_period", label: "Period under review", type: "text", required: true, placeholder: "e.g. Jan – Dec 2025" },
    { name: "prior_auditor", label: "Previous auditor (if any)", type: "text" },
    { name: "target_completion", label: "Target completion date", type: "text", placeholder: "YYYY-MM-DD" },
    { name: "notes", label: "Anything else we should know", type: "textarea", colSpan: 2 },
  ],
});

export const AUDITS: AuditServiceDef[] = [
  // ============ CORE (existing external landings) ============
  {
    slug: "vapt", dbType: "vapt", route: "/vapt", external: true, icon: Fingerprint, category: "core",
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
    slug: "pci-dss", dbType: "pci_dss", route: "/pci-dss", external: true, icon: ShieldCheck, category: "core",
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
    slug: "aml-cft", dbType: "aml_cft", route: "/audits/aml-cft", icon: Scale, category: "financial",
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
      { title: "Institution profile", fields: [
        { name: "legal_name", label: "Registered legal name", type: "text", required: true, colSpan: 2 },
        { name: "rc_number", label: "RC / CAC number", type: "text", required: true },
        { name: "regulator", label: "Primary regulator", type: "select", required: true, options: ["Central Bank of Nigeria (CBN)","SEC Nigeria","NAICOM","NFIU direct reporter","Other"] },
        { name: "license_type", label: "License type / category", type: "text", required: true, placeholder: "e.g. Commercial bank, MFB, BDC, PSB, Fintech PSSP, Asset manager, Insurer" },
        { name: "date_licensed", label: "Date licensed", type: "text", placeholder: "YYYY-MM" },
        { name: "num_branches", label: "Branches / offices", type: "number" },
        { name: "num_staff", label: "Total staff", type: "number" },
        { name: "num_customers", label: "Active customers", type: "number" },
      ]},
      { title: "AML/CFT program", fields: [
        { name: "mlro_name", label: "Chief Compliance Officer / MLRO", type: "text", required: true },
        { name: "mlro_email", label: "MLRO email", type: "email", required: true },
        { name: "policy_last_reviewed", label: "AML policy last reviewed", type: "text", placeholder: "YYYY-MM" },
        { name: "board_approved", label: "Board-approved AML/CFT policy?", type: "select", options: ["Yes","No","Under review"] },
        { name: "risk_assessment_date", label: "Last enterprise-wide risk assessment", type: "text", placeholder: "YYYY-MM" },
        { name: "screening_tool", label: "Sanctions / PEP screening tool", type: "text", placeholder: "e.g. Refinitiv World-Check, Dow Jones, in-house" },
        { name: "tm_tool", label: "Transaction monitoring system", type: "text", placeholder: "e.g. SAS AML, Actimize, in-house" },
        { name: "goaml_registered", label: "goAML registered with NFIU?", type: "select", options: ["Yes","No","In progress"] },
      ]},
      { title: "Volumes & exposure", fields: [
        { name: "monthly_transactions", label: "Avg monthly transaction volume (count)", type: "text", placeholder: "e.g. 1.2M" },
        { name: "monthly_value_ngn", label: "Avg monthly transaction value (₦)", type: "text" },
        { name: "cross_border_pct", label: "% cross-border activity", type: "text" },
        { name: "high_risk_customers", label: "High-risk customer segments", type: "textarea", colSpan: 2 },
        { name: "prior_sar_ctr", label: "SARs / CTRs filed in the last 12 months", type: "text" },
        { name: "regulatory_actions", label: "Regulatory actions / findings in last 24 months", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["Annual independent audit (regulatory)","Pre-regulator on-site examination","Post-inspection remediation","Correspondent bank onboarding","Board / Audit Committee request","Other"]),
    ],
  },
  {
    slug: "iso-27001", dbType: "iso_27001", route: "/audits/iso-27001", icon: FileLock2, category: "governance",
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
      orgContactSection,
      { title: "ISMS scope", fields: [
        { name: "scope_statement", label: "ISMS scope statement", type: "textarea", required: true, colSpan: 2 },
        { name: "certification_status", label: "Certification status", type: "select", required: true, options: ["Not certified — targeting first certification","Certified — surveillance audit","Certified — recertification","Transitioning from 2013 to 2022"] },
        { name: "target_certification_body", label: "Target certification body", type: "text", placeholder: "e.g. BSI, DNV, TÜV, DQS" },
        { name: "target_stage1_date", label: "Target Stage-1 date", type: "text", placeholder: "YYYY-MM" },
        { name: "soa_version", label: "Current SoA version / date", type: "text" },
        { name: "risk_methodology", label: "Risk assessment methodology", type: "text", placeholder: "e.g. ISO 27005, NIST SP 800-30" },
      ]},
      { title: "Controls & operations", fields: [
        { name: "cloud_providers", label: "Cloud & hosting providers", type: "textarea", colSpan: 2 },
        { name: "critical_apps", label: "Business-critical applications", type: "textarea", colSpan: 2 },
        { name: "incidents_12mo", label: "Security incidents in last 12 months", type: "text" },
        { name: "last_internal_audit", label: "Last internal ISMS audit", type: "text", placeholder: "YYYY-MM" },
        { name: "last_mgmt_review", label: "Last management review", type: "text", placeholder: "YYYY-MM" },
        { name: "excluded_controls", label: "Annex A controls excluded (with justification)", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["Readiness / gap assessment","Internal audit (Clause 9.2)","Pre-certification mock audit","Post-audit remediation review"]),
    ],
  },
  {
    slug: "ndpr", dbType: "ndpr", route: "/audits/ndpr", icon: Landmark, category: "governance",
    name: "NDPR / NDPA Audit",
    short: "Nigeria Data Protection Act audit and NDPR compliance filing for data controllers & processors.",
    standard: "NDPA 2023 · NDPR 2019 · NDPR Implementation Framework",
    hero: "Data Protection Compliance Audit aligned to the Nigeria Data Protection Act 2023 and NDPR — required annually for data controllers of major importance.",
    outcomes: [
      "Data inventory & lawful basis mapping",
      "DPIA review, DSR pipeline & breach playbook testing",
      "Cross-border transfer & processor contract review",
      "NDPC audit filing package (DCMI)",
    ],
    sections: [
      { title: "Data controller profile", fields: [
        { name: "legal_name", label: "Registered legal name", type: "text", required: true, colSpan: 2 },
        { name: "rc_number", label: "RC / CAC number", type: "text", required: true },
        { name: "sector", label: "Sector", type: "select", required: true, options: ["Financial services","Health","Telecoms / ISP","Education","Public sector","E-commerce / retail","Technology / SaaS","Insurance","Other"] },
        { name: "dcmi_status", label: "Data Controller of Major Importance (DCMI)?", type: "select", required: true, options: ["Yes — registered with NDPC","Yes — not yet registered","No","Not sure"] },
        { name: "dpo_name", label: "Data Protection Officer (DPO)", type: "text", required: true },
        { name: "dpo_email", label: "DPO email", type: "email", required: true },
        { name: "dpco_licensed", label: "Engaged a licensed DPCO?", type: "select", options: ["Yes","No","In procurement"] },
      ]},
      { title: "Data processing", fields: [
        { name: "data_subjects_count", label: "Approx. Nigerian data subjects held", type: "text", required: true },
        { name: "sensitive_categories", label: "Sensitive personal data processed", type: "textarea", colSpan: 2 },
        { name: "lawful_bases", label: "Lawful bases relied on", type: "textarea", colSpan: 2 },
        { name: "processors_count", label: "Number of data processors / sub-processors", type: "number" },
        { name: "cross_border", label: "Cross-border data transfers?", type: "select", required: true, options: ["No","Yes — adequacy country only","Yes — SCCs / BCRs","Yes — consent-based","Yes — other"] },
        { name: "cross_border_countries", label: "Destination countries", type: "text" },
      ]},
      { title: "Governance & incidents", fields: [
        { name: "privacy_policy_url", label: "Public privacy policy URL", type: "url" },
        { name: "last_audit_date", label: "Last data protection audit filed", type: "text", placeholder: "YYYY-MM" },
        { name: "dpia_count_12mo", label: "DPIAs conducted in last 12 months", type: "number" },
        { name: "dsr_volume_12mo", label: "Data subject requests handled (12mo)", type: "text" },
        { name: "breaches_12mo", label: "Notifiable breaches in last 12 months", type: "text" },
        { name: "breach_notification_sla", label: "Internal breach notification SLA", type: "text" },
      ]},
      engagementSection(["Annual NDPR compliance audit (DCMI filing)","NDPC enforcement / investigation response","Pre-onboarding due diligence","M&A / fundraising diligence","Internal assurance","Other"]),
    ],
  },

  // ============ FINANCIAL / REGULATOR ============
  {
    slug: "cbn-rcsf", dbType: "cbn_rcsf", route: "/audits/cbn-rcsf", icon: Landmark, category: "financial",
    name: "CBN Risk-Based Cybersecurity Framework",
    short: "Mandatory annual cybersecurity audit for CBN-regulated banks, OFIs, PSPs, PSSPs, MMOs and payment institutions.",
    standard: "CBN Risk-Based Cybersecurity Framework & Guidelines (2022, as amended)",
    hero: "Independent cybersecurity audit against the CBN Risk-Based Cybersecurity Framework — mandatory for all CBN-licensed institutions.",
    outcomes: [
      "Cyber-risk assessment aligned to CBN maturity tiers",
      "Governance, ID & access, threat & vulnerability, and cyber-resilience testing",
      "Incident reporting & breach-notification workflow test",
      "CBN-ready audit report + board attestation pack",
    ],
    sections: [
      { title: "Institution profile", fields: [
        { name: "legal_name", label: "Registered legal name", type: "text", required: true, colSpan: 2 },
        { name: "license_category", label: "CBN license category", type: "select", required: true, options: ["Commercial bank","Merchant bank","MFB","PSB","PSSP","MMO","Switching & processing","Super-agent","BDC","Finance company","OFI — other"] },
        { name: "ciso_name", label: "CISO / Head of Cybersecurity", type: "text", required: true },
        { name: "ciso_email", label: "CISO email", type: "email", required: true },
        { name: "board_committee", label: "Board Risk / IT Committee chair", type: "text" },
        { name: "maturity_target", label: "Target CBN maturity level", type: "select", options: ["Baseline","Standard","Advanced","Not yet defined"] },
      ]},
      { title: "Cyber posture", fields: [
        { name: "framework_baseline", label: "Frameworks currently followed", type: "textarea", colSpan: 2, placeholder: "e.g. NIST CSF, ISO 27001, PCI DSS, COBIT" },
        { name: "soc_status", label: "SOC (Security Operations Centre)", type: "select", options: ["In-house 24x7","Hybrid","MSSP","None"] },
        { name: "last_pentest", label: "Last independent VAPT", type: "text", placeholder: "YYYY-MM" },
        { name: "critical_incidents_12mo", label: "Reportable incidents to CBN (12mo)", type: "text" },
        { name: "ransomware_history", label: "Any ransomware / destructive events in 24 months?", type: "select", options: ["No","Yes — contained","Yes — with downtime"] },
        { name: "third_party_criticals", label: "Critical third-party providers", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["Annual CBN-mandated audit","Post-incident regulator submission","Licensing / new product approval","Board request","Other"]),
    ],
  },
  {
    slug: "swift-csp", dbType: "swift_csp", route: "/audits/swift-csp", icon: Network, category: "financial",
    name: "SWIFT CSP Attestation",
    short: "Independent assessment against SWIFT Customer Security Programme mandatory & advisory controls.",
    standard: "SWIFT CSP CSCF v2025 (or applicable year)",
    hero: "Independent SWIFT CSP attestation covering the Customer Security Controls Framework — required annually via KYC-SA.",
    outcomes: [
      "Architecture-type validation (A1/A2/A3/A4/B)",
      "Mandatory & advisory control testing with evidence",
      "KYC-SA v2 attestation package",
      "Remediation plan for non-compliant controls",
    ],
    sections: [
      { title: "SWIFT footprint", fields: [
        { name: "bic", label: "Primary BIC", type: "text", required: true },
        { name: "additional_bics", label: "Additional BICs", type: "text" },
        { name: "architecture_type", label: "Architecture type", type: "select", required: true, options: ["A1 — owned communication interface","A2 — partial stack","A3 — customer connector only","A4 — no local stack (Lite2 / cloud)","B — application-based","Not sure"] },
        { name: "swift_interface", label: "SWIFT interface / product", type: "text", placeholder: "e.g. Alliance Access, SIL, Lite2, Web Platform" },
        { name: "service_bureau", label: "Using a Service Bureau?", type: "select", options: ["No","Yes"] },
        { name: "service_bureau_name", label: "Service Bureau name (if any)", type: "text" },
      ]},
      { title: "Environment & operations", fields: [
        { name: "hosting", label: "Hosting model", type: "select", options: ["On-premises","Colocation","Public cloud","Hybrid"] },
        { name: "operator_pcs_isolated", label: "Dedicated operator PCs / jump servers?", type: "select", options: ["Yes","No","Partial"] },
        { name: "mfa_operators", label: "MFA enforced for all SWIFT operators?", type: "select", options: ["Yes","No"] },
        { name: "last_attestation_year", label: "Last CSP attestation year", type: "text" },
        { name: "prior_findings", label: "Non-compliant controls in last attestation", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["Annual mandatory attestation","Post-incident review","Correspondent bank request","New SWIFT connection go-live","Other"]),
    ],
  },
  {
    slug: "soc-2", dbType: "soc_2", route: "/audits/soc-2", icon: BadgeCheck, category: "financial",
    name: "SOC 2 (Type I & II)",
    short: "AICPA SOC 2 readiness or examination against Security, Availability, Confidentiality, Processing Integrity, Privacy.",
    standard: "AICPA TSP 100 · SSAE 18 · SOC 2 (Type I / Type II)",
    hero: "SOC 2 readiness or attestation covering the Trust Services Criteria — the enterprise trust bar for SaaS and cloud providers.",
    outcomes: [
      "TSC scoping (Security + selected criteria)",
      "Control design assessment (Type I) or operating effectiveness (Type II)",
      "Evidence collection playbook and control library",
      "Bridge / report package tailored to buyer requests",
    ],
    sections: [
      orgContactSection,
      { title: "SOC 2 context", fields: [
        { name: "report_type", label: "Report type requested", type: "select", required: true, options: ["Readiness assessment","SOC 2 Type I","SOC 2 Type II — 3-month window","SOC 2 Type II — 6-month window","SOC 2 Type II — 12-month window"] },
        { name: "tsc_selected", label: "Trust Services Criteria in scope", type: "textarea", colSpan: 2, placeholder: "Security (required) + any of: Availability, Confidentiality, Processing Integrity, Privacy" },
        { name: "system_description", label: "System / product description", type: "textarea", required: true, colSpan: 2 },
        { name: "customer_count", label: "Enterprise customers (approx.)", type: "text" },
        { name: "sub_service_orgs", label: "Sub-service organisations", type: "textarea", colSpan: 2, placeholder: "e.g. AWS, Datadog, Auth0, Stripe" },
        { name: "prior_report", label: "Prior SOC 2 report(s)?", type: "select", options: ["No","Yes — Type I only","Yes — Type II"] },
      ]},
      { title: "Controls & operations", fields: [
        { name: "grc_platform", label: "GRC / compliance platform in use", type: "text", placeholder: "e.g. Vanta, Drata, Secureframe, none" },
        { name: "policy_pack", label: "Written policy pack in place?", type: "select", options: ["Full pack","Partial","None"] },
        { name: "change_mgmt", label: "Change management system", type: "text" },
        { name: "monitoring_stack", label: "Monitoring / logging stack", type: "textarea", colSpan: 2 },
        { name: "incidents_12mo", label: "Security / availability incidents (12mo)", type: "text" },
      ]},
      engagementSection(["Enterprise buyer requirement","Renewal / re-issuance","M&A / fundraising diligence","Internal control uplift","Other"]),
    ],
  },
  {
    slug: "ndic", dbType: "ndic", route: "/audits/ndic", icon: Building2, category: "financial",
    name: "NDIC / Internal Controls Audit",
    short: "Deposit insurance and internal controls audit for CBN-licensed deposit-taking institutions and MFBs.",
    standard: "NDIC Act 2023 · CBN Prudential Guidelines · IIA Standards",
    hero: "Independent internal controls review aligned to NDIC and CBN prudential expectations for deposit-taking institutions.",
    outcomes: [
      "COSO-aligned internal controls assessment",
      "Deposit insurance premium & returns validation",
      "Credit, treasury, and operations control testing",
      "NDIC-ready audit report",
    ],
    sections: [
      { title: "Institution profile", fields: [
        { name: "legal_name", label: "Legal name", type: "text", required: true, colSpan: 2 },
        { name: "license_type", label: "License type", type: "select", required: true, options: ["Commercial bank","Merchant bank","National MFB","State MFB","Unit MFB","PMB","PSB","Other"] },
        { name: "total_deposits", label: "Total deposits (₦)", type: "text" },
        { name: "branch_count", label: "Number of branches", type: "number" },
        { name: "core_banking", label: "Core banking system", type: "text" },
      ]},
      { title: "Controls & prior findings", fields: [
        { name: "internal_audit_head", label: "Head of Internal Audit", type: "text", required: true },
        { name: "last_ndic_exam", label: "Last NDIC examination date", type: "text", placeholder: "YYYY-MM" },
        { name: "outstanding_ndic_findings", label: "Outstanding NDIC findings", type: "textarea", colSpan: 2 },
        { name: "prudential_ratios", label: "Current key prudential ratios", type: "textarea", colSpan: 2, placeholder: "CAR, NPL, liquidity ratio…" },
      ]},
      engagementSection(["Annual internal controls audit","Pre-NDIC on-site exam","Post-exam remediation validation","Board Audit Committee request","Other"]),
    ],
  },

  // ============ GOVERNANCE & PRIVACY ============
  {
    slug: "gdpr", dbType: "gdpr", route: "/audits/gdpr", icon: Globe2, category: "governance",
    name: "GDPR Readiness Audit",
    short: "EU GDPR compliance audit for organisations offering goods, services, or monitoring in the EU/EEA.",
    standard: "EU GDPR 2016/679 · EDPB Guidelines · UK GDPR",
    hero: "GDPR compliance audit covering Articles 5–34, DPIA readiness, cross-border transfers, and DPO obligations.",
    outcomes: [
      "Record of Processing Activities (Article 30) review",
      "DPIA / TIA methodology and outputs",
      "SCC / BCR / adequacy transfer assessment",
      "Article 33/34 breach-response playbook validation",
    ],
    sections: [
      orgContactSection,
      { title: "EU exposure", fields: [
        { name: "eu_data_subjects", label: "EU / EEA data subjects (approx.)", type: "text", required: true },
        { name: "eu_representative", label: "EU representative appointed (Art. 27)?", type: "select", options: ["Yes","No","N/A — established in EU"] },
        { name: "lead_supervisory", label: "Lead supervisory authority", type: "text" },
        { name: "dpo_appointed", label: "DPO appointed (Art. 37)?", type: "select", options: ["Yes","No","Not required"] },
        { name: "special_categories", label: "Special-category data processed (Art. 9)", type: "textarea", colSpan: 2 },
      ]},
      { title: "Transfers & processors", fields: [
        { name: "sub_processors", label: "Sub-processors and their locations", type: "textarea", colSpan: 2 },
        { name: "transfer_mechanism", label: "Transfer mechanism used", type: "select", options: ["Adequacy decision","Standard Contractual Clauses (2021)","Binding Corporate Rules","Derogations (Art. 49)","Not applicable"] },
        { name: "tia_completed", label: "Transfer Impact Assessments completed?", type: "select", options: ["Yes — all transfers","Partial","No"] },
      ]},
      engagementSection(["Enterprise buyer / procurement requirement","Post-breach remediation","Regulator inquiry","New EU market launch","Internal assurance","Other"]),
    ],
  },
  {
    slug: "hipaa", dbType: "hipaa", route: "/audits/hipaa", icon: HeartPulse, category: "governance",
    name: "HIPAA Readiness Audit",
    short: "HIPAA Privacy, Security & Breach Notification Rules audit for covered entities and business associates.",
    standard: "HIPAA / HITECH · 45 CFR Parts 160, 162 & 164",
    hero: "HIPAA readiness audit covering the Privacy Rule, Security Rule, and Breach Notification Rule — for health-tech, telemedicine, and BA services.",
    outcomes: [
      "Covered entity vs. business associate classification",
      "Administrative, physical, and technical safeguards testing",
      "PHI data flow & minimum-necessary review",
      "BAA + breach playbook review",
    ],
    sections: [
      orgContactSection,
      { title: "PHI handling", fields: [
        { name: "entity_type", label: "Entity type", type: "select", required: true, options: ["Covered entity","Business associate","Sub-contractor","Hybrid entity"] },
        { name: "phi_categories", label: "PHI categories handled", type: "textarea", colSpan: 2 },
        { name: "phi_volume", label: "Approximate PHI records held", type: "text" },
        { name: "phi_locations", label: "Storage locations / cloud regions", type: "textarea", colSpan: 2 },
        { name: "baa_count", label: "Number of active BAAs", type: "number" },
        { name: "prior_hhs_notice", label: "Any prior HHS / OCR investigation?", type: "select", options: ["No","Yes — closed","Yes — ongoing"] },
      ]},
      engagementSection(["US market entry","Enterprise health customer requirement","Post-breach remediation","Annual security risk assessment (§164.308)","Other"]),
    ],
  },
  {
    slug: "nitda-grc", dbType: "nitda_grc", route: "/audits/nitda-grc", icon: Landmark, category: "governance",
    name: "NITDA GRC / IT Project Clearance",
    short: "NITDA GRC audit and IT Project Clearance for MDAs, contractors, and public-sector IT deployments in Nigeria.",
    standard: "NITDA Act 2007 · NITDA GRC Regulations · IT Project Clearance Guidelines",
    hero: "NITDA GRC audit and IT Project Clearance support — required for public-sector IT procurement and MDA solution deployments in Nigeria.",
    outcomes: [
      "GRC domain assessment (Governance, Risk, Compliance)",
      "IT Project Clearance documentation & submission support",
      "Local content and procurement alignment",
      "NITDA-ready audit and clearance certificate package",
    ],
    sections: [
      orgContactSection,
      { title: "Project / entity context", fields: [
        { name: "entity_type", label: "Entity type", type: "select", required: true, options: ["MDA","MDA IT contractor","Private sector solution vendor","State government","Other"] },
        { name: "project_name", label: "Project / solution name", type: "text", required: true, colSpan: 2 },
        { name: "project_value_ngn", label: "Estimated project value (₦)", type: "text" },
        { name: "beneficiary_mda", label: "Beneficiary MDA (if any)", type: "text" },
        { name: "local_content_pct", label: "Local content %", type: "text" },
      ]},
      engagementSection(["IT Project Clearance submission","NITDA GRC audit","Post-award compliance verification","Procurement bid requirement","Other"]),
    ],
  },
  {
    slug: "iso-22301", dbType: "iso_22301", route: "/audits/iso-22301", icon: LifeBuoy, category: "governance",
    name: "ISO 22301 Business Continuity",
    short: "Business Continuity Management System audit and readiness assessment for critical service providers.",
    standard: "ISO 22301:2019",
    hero: "ISO 22301 BCMS audit — business continuity, disaster recovery, and operational resilience across your critical services.",
    outcomes: [
      "Business Impact Analysis (BIA) review",
      "Continuity strategy & recovery objective validation (RTO/RPO/MBCO)",
      "Exercise & test programme evaluation",
      "Certification or internal audit report",
    ],
    sections: [
      orgContactSection,
      { title: "Continuity posture", fields: [
        { name: "critical_processes", label: "Business-critical processes / services", type: "textarea", required: true, colSpan: 2 },
        { name: "rto_range", label: "Typical RTO range", type: "text", placeholder: "e.g. 1h – 24h" },
        { name: "rpo_range", label: "Typical RPO range", type: "text" },
        { name: "dr_sites", label: "DR site(s) / cloud regions", type: "textarea", colSpan: 2 },
        { name: "last_bia_date", label: "Last BIA date", type: "text", placeholder: "YYYY-MM" },
        { name: "last_dr_test", label: "Last full DR test date", type: "text", placeholder: "YYYY-MM" },
        { name: "prior_incidents", label: "Major continuity incidents in 24mo", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["First certification","Recertification / surveillance","Internal audit","Post-incident review","Board / regulator request","Other"]),
    ],
  },

  // ============ TECHNICAL / CYBER ============
  {
    slug: "cloud-config", dbType: "cloud_config", route: "/audits/cloud-config", icon: Cloud, category: "technical",
    name: "Cloud Security Configuration Audit",
    short: "AWS / Azure / GCP configuration and workload security audit against CIS Benchmarks & provider Well-Architected.",
    standard: "CIS Benchmarks · AWS/Azure/GCP Well-Architected · NIST SP 800-53",
    hero: "Deep cloud configuration audit — IAM, networking, data, workload, logging, and control-plane hardening against CIS Benchmarks.",
    outcomes: [
      "Full CIS Benchmark scored assessment",
      "IAM least-privilege & privilege-escalation path review",
      "Data & key management (KMS/CMK) validation",
      "Prioritised remediation with IaC-ready fixes",
    ],
    sections: [
      { title: "Cloud footprint", fields: [
        { name: "providers", label: "Cloud providers in scope", type: "textarea", required: true, colSpan: 2, placeholder: "e.g. AWS eu-west-1 & af-south-1, Azure UK South, GCP europe-west1" },
        { name: "account_count", label: "Total accounts / subscriptions / projects", type: "number", required: true },
        { name: "workload_types", label: "Workload types", type: "textarea", colSpan: 2, placeholder: "e.g. EKS, Lambda, RDS, S3, AKS, GKE, BigQuery" },
        { name: "iac_used", label: "Infrastructure-as-code in use", type: "select", options: ["Terraform","CloudFormation","Pulumi","Bicep/ARM","None / manual","Mixed"] },
        { name: "runtime_hours_per_month", label: "Compute footprint (approx. vCPU-hrs / mo)", type: "text" },
      ]},
      { title: "Existing controls", fields: [
        { name: "iam_model", label: "IAM model", type: "textarea", colSpan: 2, placeholder: "e.g. SSO via Okta → IAM Identity Center, break-glass root accounts" },
        { name: "network_topology", label: "Network topology", type: "textarea", colSpan: 2, placeholder: "VPCs, transit gateway, private endpoints, egress model" },
        { name: "kms_model", label: "KMS / key management", type: "text" },
        { name: "logging_stack", label: "Logging & monitoring stack", type: "textarea", colSpan: 2, placeholder: "e.g. CloudTrail → S3, GuardDuty, Wiz, Prisma, Datadog" },
        { name: "cspm_in_use", label: "CSPM / CNAPP tool in use", type: "text", placeholder: "e.g. Wiz, Prisma, Orca, none" },
      ]},
      engagementSection(["Pre-launch hardening","Post-incident remediation","Annual security review","M&A diligence","Cloud migration validation","Other"]),
    ],
  },
  {
    slug: "source-code", dbType: "source_code", route: "/audits/source-code", icon: Code2, category: "technical",
    name: "Source Code Security Review",
    short: "Manual + SAST secure code review of critical application logic, cryptography, and dependency chain.",
    standard: "OWASP ASVS · OWASP SCP · CWE Top 25",
    hero: "Deep secure code review beyond dynamic testing — business logic, cryptography, secret handling, and supply-chain risk.",
    outcomes: [
      "Manual review of critical paths (auth, payment, session, crypto)",
      "SAST + dependency-chain analysis (SBOM)",
      "OWASP ASVS coverage report",
      "Prioritised findings with code-level fix guidance",
    ],
    sections: [
      { title: "Codebase profile", fields: [
        { name: "repo_platform", label: "Repository platform", type: "select", required: true, options: ["GitHub","GitLab","Bitbucket","Azure DevOps","Self-hosted"] },
        { name: "languages", label: "Primary languages / frameworks", type: "textarea", required: true, colSpan: 2, placeholder: "e.g. TypeScript/React, Node.js, Go, Python/Django, Java Spring" },
        { name: "loc", label: "Approximate lines of code in scope", type: "text", required: true, placeholder: "e.g. 250k backend + 120k frontend" },
        { name: "repos_in_scope", label: "Number of repositories in scope", type: "number" },
        { name: "monorepo", label: "Monorepo?", type: "select", options: ["Yes","No","Partial"] },
      ]},
      { title: "Critical surfaces", fields: [
        { name: "auth_model", label: "Authentication / session model", type: "textarea", colSpan: 2 },
        { name: "authz_model", label: "Authorization model", type: "textarea", colSpan: 2, placeholder: "RBAC, ABAC, tenancy isolation, row-level security" },
        { name: "crypto_usage", label: "Cryptography usage", type: "textarea", colSpan: 2, placeholder: "TLS, at-rest encryption, KDFs, custom crypto (avoid!)" },
        { name: "payment_flows", label: "Payment / money-movement flows", type: "textarea", colSpan: 2 },
        { name: "sensitive_libraries", label: "Sensitive / bespoke libraries", type: "textarea", colSpan: 2 },
        { name: "prior_findings", label: "Prior SAST / audit findings still open", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["Pre-launch security gate","Post-incident deep dive","M&A / fundraising diligence","Annual review","Enterprise customer requirement","Other"]),
    ],
  },
  {
    slug: "red-team", dbType: "red_team", route: "/audits/red-team", icon: Swords, category: "technical",
    name: "Red Team Engagement",
    short: "Objective-based adversary simulation across digital, social, and physical attack surfaces.",
    standard: "MITRE ATT&CK · TIBER-EU · CREST STAR",
    hero: "Full-scope, objective-based red team engagement — testing your detection & response, not just your controls.",
    outcomes: [
      "Threat-intelligence-led scenarios mapped to MITRE ATT&CK",
      "Multi-vector attack chains (phishing, initial access, lateral, exfil)",
      "Blue team detection-gap analysis + purple team debrief",
      "Board-level narrative report + technical playbook",
    ],
    sections: [
      { title: "Engagement rules", fields: [
        { name: "objectives", label: "Business-level objectives", type: "textarea", required: true, colSpan: 2, placeholder: "e.g. reach production customer PII datastore, initiate wire transfer, exfil source repo" },
        { name: "in_scope_assets", label: "In-scope assets & environments", type: "textarea", required: true, colSpan: 2 },
        { name: "out_of_scope", label: "Out-of-scope assets / boundaries", type: "textarea", colSpan: 2 },
        { name: "allowed_vectors", label: "Allowed vectors", type: "textarea", colSpan: 2, placeholder: "e.g. phishing, vishing, physical (with escort), USB drops, wifi, insider assumption" },
        { name: "blueteam_notified", label: "Blue team awareness", type: "select", options: ["Full black-box (nobody knows)","Trusted agent aware","Blue team aware — assumed-breach"] },
      ]},
      { title: "Environment profile", fields: [
        { name: "org_size", label: "Employees in target org", type: "number" },
        { name: "primary_stack", label: "Primary tech stack", type: "textarea", colSpan: 2 },
        { name: "edr_soc", label: "EDR / SOC / MDR in use", type: "textarea", colSpan: 2 },
        { name: "prior_engagements", label: "Prior red team / pentest history", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["Regulator-required exercise (e.g. TIBER-like)","Post-incident validation","Detection & response uplift","Board request","M&A diligence","Other"]),
    ],
  },
  {
    slug: "blockchain", dbType: "blockchain", route: "/audits/blockchain", icon: Blocks, category: "technical",
    name: "Smart Contract / Blockchain Audit",
    short: "Solidity / Rust / Move smart contract audit and blockchain protocol security review.",
    standard: "SWC Registry · SCSVS · Trail of Bits Building Secure Contracts",
    hero: "Smart contract and blockchain protocol security review — Solidity, EVM chains, and select non-EVM ecosystems.",
    outcomes: [
      "Line-by-line manual review + fuzzing + symbolic execution",
      "SWC / SCSVS coverage with severity-ranked findings",
      "Economic / MEV / oracle risk analysis",
      "Re-audit of remediated PRs included",
    ],
    sections: [
      { title: "Protocol profile", fields: [
        { name: "protocol_name", label: "Protocol / product name", type: "text", required: true, colSpan: 2 },
        { name: "chain", label: "Target chain(s)", type: "textarea", required: true, colSpan: 2, placeholder: "e.g. Ethereum L1, Arbitrum, Base, Solana, Sui, TON" },
        { name: "language", label: "Contract language(s)", type: "select", required: true, options: ["Solidity","Vyper","Rust (Solana)","Rust (Substrate/CosmWasm)","Move","Cairo","Other"] },
        { name: "loc_solidity", label: "Approximate LoC in scope", type: "text", required: true },
        { name: "contract_count", label: "Number of contracts / programs in scope", type: "number" },
        { name: "tvl_expected", label: "Expected TVL / value handled", type: "text" },
      ]},
      { title: "Risk surface", fields: [
        { name: "external_deps", label: "External protocol dependencies", type: "textarea", colSpan: 2, placeholder: "e.g. Chainlink oracles, Uniswap v3 pools, LayerZero" },
        { name: "upgradeability", label: "Upgradeability pattern", type: "select", options: ["Immutable","Transparent proxy","UUPS","Beacon","Diamond","Custom","N/A"] },
        { name: "admin_keys", label: "Admin keys / privileged roles", type: "textarea", colSpan: 2 },
        { name: "prior_audits", label: "Prior audit reports", type: "textarea", colSpan: 2 },
        { name: "known_issues", label: "Known open issues", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["Pre-mainnet launch","Pre-upgrade / new module","Post-incident review","Investor / listing requirement","Bug bounty preparation","Other"]),
    ],
  },

  // ============ EMERGING & SPECIALTY ============
  {
    slug: "iso-42001", dbType: "iso_42001", route: "/audits/iso-42001", icon: BrainCircuit, category: "specialty",
    name: "ISO/IEC 42001 AI Management",
    short: "AI Management System audit against ISO/IEC 42001:2023 — the first AI governance standard.",
    standard: "ISO/IEC 42001:2023 · ISO/IEC 23894:2023 · NIST AI RMF",
    hero: "Independent audit of your AI Management System against ISO/IEC 42001:2023 — governance, risk, transparency, and lifecycle controls.",
    outcomes: [
      "AI system inventory & risk categorisation",
      "Clause 4–10 conformance + Annex A controls",
      "AI impact / bias / transparency assessment",
      "Non-conformity report + roadmap",
    ],
    sections: [
      orgContactSection,
      { title: "AI systems in scope", fields: [
        { name: "ai_systems", label: "AI systems in scope", type: "textarea", required: true, colSpan: 2, placeholder: "product name, purpose, whether GenAI / traditional ML, deployed / in dev" },
        { name: "ai_role", label: "Your role", type: "select", required: true, options: ["AI provider / developer","AI deployer / user","Both","AI-embedded product vendor"] },
        { name: "highest_risk_tier", label: "Highest risk tier used", type: "select", options: ["Prohibited","High-risk","Limited-risk","Minimal risk","Not classified"] },
        { name: "models_used", label: "Underlying models / vendors", type: "textarea", colSpan: 2 },
        { name: "training_data", label: "Training / fine-tuning data provenance", type: "textarea", colSpan: 2 },
      ]},
      { title: "Governance & lifecycle", fields: [
        { name: "ai_policy", label: "AI policy in place?", type: "select", options: ["Yes","No","Under review"] },
        { name: "impact_assessment", label: "AI impact assessments performed?", type: "select", options: ["For every high-risk system","Some systems","None"] },
        { name: "monitoring", label: "Post-deployment monitoring", type: "textarea", colSpan: 2 },
        { name: "incident_history", label: "AI incidents (last 12mo)", type: "textarea", colSpan: 2 },
      ]},
      engagementSection(["First certification / readiness","Investor / enterprise customer requirement","Post-incident review","EU AI Act preparation","Internal assurance","Other"]),
    ],
  },
  {
    slug: "vendor-risk", dbType: "vendor_risk", route: "/audits/vendor-risk", icon: Truck, category: "specialty",
    name: "Third-Party / Vendor Risk Audit",
    short: "Vendor security posture assessment and third-party risk management (TPRM) programme audit.",
    standard: "ISO/IEC 27036 · NIST SP 800-161 · SIG / CAIQ",
    hero: "Vendor risk audit — assess a critical supplier's security posture, or audit your own TPRM programme end-to-end.",
    outcomes: [
      "Vendor security questionnaire + evidence review",
      "Onsite / remote controls assessment",
      "Contract, DPA, and BAA review",
      "TPRM maturity scorecard + remediation plan",
    ],
    sections: [
      orgContactSection,
      { title: "Assessment scope", fields: [
        { name: "assessment_mode", label: "Assessment mode", type: "select", required: true, options: ["Assess a specific vendor","Assess our TPRM programme","Both"] },
        { name: "vendor_name", label: "Vendor name (if specific vendor)", type: "text" },
        { name: "vendor_service", label: "Service provided by vendor", type: "textarea", colSpan: 2 },
        { name: "vendor_data_access", label: "Data / systems the vendor accesses", type: "textarea", colSpan: 2 },
        { name: "vendor_criticality", label: "Vendor criticality", type: "select", options: ["Critical (Tier 1)","Important (Tier 2)","Standard (Tier 3)"] },
        { name: "vendor_count_total", label: "Total active vendors (for programme audit)", type: "text" },
      ]},
      engagementSection(["New vendor onboarding","Annual vendor re-assessment","Post-incident vendor review","TPRM programme maturity audit","Regulator / customer request","Other"]),
    ],
  },
  {
    slug: "mobile-masvs", dbType: "mobile_masvs", route: "/audits/mobile-masvs", icon: Smartphone, category: "specialty",
    name: "Mobile App Security Audit (MASVS)",
    short: "Deep iOS and Android application security audit against OWASP MASVS & MASTG.",
    standard: "OWASP MASVS 2.0 · OWASP MASTG · NIAP",
    hero: "Focused mobile application security audit — MASVS L1/L2 controls with resiliency (R) testing for anti-tamper / anti-reversing.",
    outcomes: [
      "MASVS storage, crypto, auth, network, platform, code, resiliency review",
      "Static & dynamic analysis on device / emulator",
      "Root/jailbreak, anti-tamper, and RASP testing",
      "Prioritised findings with fix guidance",
    ],
    sections: [
      { title: "App profile", fields: [
        { name: "app_name", label: "App name", type: "text", required: true, colSpan: 2 },
        { name: "platforms", label: "Platforms in scope", type: "select", required: true, options: ["iOS only","Android only","iOS + Android"] },
        { name: "framework", label: "Framework", type: "select", required: true, options: ["Native (Swift/Kotlin)","React Native","Flutter","Ionic / Capacitor","Xamarin / MAUI","Other"] },
        { name: "store_urls", label: "Store URLs (if published)", type: "textarea", colSpan: 2 },
        { name: "target_masvs_level", label: "Target MASVS level", type: "select", options: ["L1 — standard","L2 — defence-in-depth","R — resiliency layer","L2 + R"] },
      ]},
      { title: "Risk surface", fields: [
        { name: "auth_flow", label: "Authentication flow", type: "textarea", colSpan: 2, placeholder: "e.g. OIDC, biometric, MFA, device-bound tokens" },
        { name: "sensitive_data", label: "Sensitive data stored on device", type: "textarea", colSpan: 2 },
        { name: "third_party_sdks", label: "Third-party SDKs of note", type: "textarea", colSpan: 2 },
        { name: "financial_transactions", label: "Handles financial transactions?", type: "select", options: ["Yes","No"] },
      ]},
      engagementSection(["Pre-store submission","Post-launch periodic review","Enterprise / bank customer requirement","Post-incident review","M&A diligence","Other"]),
    ],
  },
  {
    slug: "dfir", dbType: "dfir", route: "/audits/dfir", icon: Siren, category: "specialty",
    name: "DFIR Readiness Audit",
    short: "Digital Forensics & Incident Response readiness — playbooks, tabletop exercises, and retainer setup.",
    standard: "NIST SP 800-61r2 · SANS PICERL · ISO/IEC 27035",
    hero: "Incident response readiness audit — playbooks, telemetry, tabletop exercises, and (optional) retainer engagement.",
    outcomes: [
      "IR plan & playbook review (ransomware, BEC, insider, data loss, cloud)",
      "Telemetry / evidence-collection coverage assessment",
      "Executive + technical tabletop exercise",
      "Optional 24/7 retainer setup",
    ],
    sections: [
      orgContactSection,
      { title: "IR posture", fields: [
        { name: "ir_lead", label: "IR / SOC lead", type: "text", required: true },
        { name: "ir_lead_email", label: "IR lead email", type: "email", required: true },
        { name: "current_playbooks", label: "Current playbooks documented", type: "textarea", colSpan: 2 },
        { name: "detection_stack", label: "Detection stack", type: "textarea", colSpan: 2, placeholder: "SIEM, EDR, NDR, CSPM, DLP…" },
        { name: "retainer_current", label: "Existing IR retainer?", type: "select", options: ["Yes","No"] },
        { name: "incidents_24mo", label: "Notable incidents in last 24 months", type: "textarea", colSpan: 2 },
      ]},
      { title: "Exercise scope", fields: [
        { name: "tabletop_audience", label: "Tabletop audience", type: "select", required: true, options: ["Executive only","Technical / SOC only","Combined executive + technical","Board-level"] },
        { name: "scenarios", label: "Preferred scenarios", type: "textarea", colSpan: 2, placeholder: "e.g. Ransomware + data extortion, BEC + wire fraud, cloud account takeover" },
        { name: "retainer_desired", label: "Add 24/7 retainer?", type: "select", options: ["Not now","Yes — evaluate options"] },
      ]},
      engagementSection(["Board / regulator request","Post-incident uplift","Cyber insurance requirement","Annual readiness","Enterprise customer request","Other"]),
    ],
  },
];

export const auditBySlug = (slug: string) => AUDITS.find((a) => a.slug === slug);

export const AUDIT_LABEL_BY_DBTYPE: Record<string, string> = Object.fromEntries(
  AUDITS.map((a) => [a.dbType, a.name])
);
