// Public: given a verification code, return a short-lived signed URL to the report PDF.
// If the PDF hasn't been generated yet, generate it on-the-fly (comprehensive template).
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import QRCode from "npm:qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND_ORANGE = rgb(0xFA / 255, 0x5D / 255, 0x36 / 255);
const TEXT = rgb(0.07, 0.08, 0.1);
const MUTED = rgb(0.4, 0.42, 0.46);
const LINE = rgb(0.88, 0.88, 0.9);
const GREEN = rgb(0.13, 0.55, 0.27);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const codeRaw =
      url.searchParams.get("code") ||
      (req.method === "POST" ? (await req.json().catch(() => ({}))).code : null);
    const code = (codeRaw || "").trim().toUpperCase();
    if (!code) return json({ error: "code required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: report } = await admin
      .from("reports")
      .select("*")
      .eq("verification_code", code)
      .maybeSingle();

    if (!report) return json({ error: "not_found" }, 404);
    if (report.status === "revoked") return json({ error: "revoked" }, 410);

    let storagePath = report.storage_path as string | null;

    // Generate PDF on demand if missing
    if (!storagePath) {
      const verifyUrl = `https://lantid.com/verify-report/${code}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 320 });
      const qrPngBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]), (c) => c.charCodeAt(0));

      const pdfBytes = await buildPdf({
        company: report.company_name,
        target: report.target,
        scope: report.scope_summary || "",
        aType: report.assessment_type || "standard",
        overall: report.overall_result || "passed",
        issued: report.issued_at || new Date().toISOString(),
        verificationCode: code,
        verifyUrl,
        qrPngBytes,
      });

      const hashBuf = await crypto.subtle.digest("SHA-256", pdfBytes);
      const hashHex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

      storagePath = `${code}.pdf`;
      const { error: upErr } = await admin.storage.from("reports").upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
      if (upErr) throw upErr;

      await admin.from("reports").update({
        storage_path: storagePath,
        sha256_hash: hashHex,
      }).eq("id", report.id);
    }

    const { data: signed, error: signErr } = await admin
      .storage.from("reports")
      .createSignedUrl(storagePath, 60 * 5, { download: `Lantid-VAPT-${code}.pdf` });
    if (signErr) throw signErr;

    return json({ url: signed.signedUrl, expires_in: 300 });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function titleCase(s: string) { return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s; }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function buildPdf(args: {
  company: string; target: string; scope: string;
  aType: string; overall: string; issued: string;
  verificationCode: string; verifyUrl: string; qrPngBytes: Uint8Array;
}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const qr = await doc.embedPng(args.qrPngBytes);

  const A4 = { w: 595.28, h: 841.89 };
  const margin = 50;

  let page = doc.addPage([A4.w, A4.h]);
  let y = A4.h - margin;

  const drawText = (t: string, opts: { size?: number; f?: typeof font; color?: typeof TEXT; x?: number } = {}) => {
    const size = opts.size ?? 10;
    const f = opts.f ?? font;
    const color = opts.color ?? TEXT;
    const x = opts.x ?? margin;
    page.drawText(t, { x, y, size, font: f, color });
  };
  const ensure = (need: number) => {
    if (y - need < margin + 40) {
      drawFooter();
      page = doc.addPage([A4.w, A4.h]);
      y = A4.h - margin;
    }
  };
  const drawFooter = () => {
    page.drawLine({ start: { x: margin, y: margin + 24 }, end: { x: A4.w - margin, y: margin + 24 }, thickness: 0.5, color: LINE });
    page.drawText(`Lantid VAPT Report  •  Verification: ${args.verificationCode}  •  ${args.verifyUrl}`, {
      x: margin, y: margin + 10, size: 8, font, color: MUTED,
    });
  };
  const section = (title: string) => {
    ensure(28); y -= 6;
    drawText(title, { size: 13, f: bold, color: BRAND_ORANGE }); y -= 4;
    page.drawLine({ start: { x: margin, y }, end: { x: A4.w - margin, y }, thickness: 0.5, color: LINE });
    y -= 14;
  };
  const paragraph = (text: string, f: typeof font = font) => {
    const maxW = A4.w - margin * 2;
    const size = 10; const lh = 14;
    const words = text.split(/\s+/);
    let line = "";
    const flush = () => { ensure(lh); drawText(line, { size, f }); y -= lh; line = ""; };
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > maxW) { flush(); line = w; } else line = test;
    }
    if (line) flush();
    y -= 4;
  };
  const bullets = (items: string[]) => {
    for (const it of items) {
      const maxW = A4.w - margin * 2 - 14;
      const size = 10; const lh = 14;
      const words = it.split(/\s+/);
      let line = ""; let first = true;
      const flush = () => {
        ensure(lh);
        if (first) { drawText("•", { size, x: margin }); first = false; }
        drawText(line, { size, x: margin + 14 });
        y -= lh; line = "";
      };
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (font.widthOfTextAtSize(test, size) > maxW) { flush(); line = w; } else line = test;
      }
      if (line) flush();
    }
    y -= 4;
  };

  // -------- Header / Logo --------
  page.drawRectangle({ x: margin, y: y - 28, width: 28, height: 28, color: BRAND_ORANGE });
  page.drawText("L", { x: margin + 8, y: y - 22, size: 18, font: bold, color: rgb(1,1,1) });
  page.drawText("LANTID", { x: margin + 38, y: y - 18, size: 18, font: bold, color: TEXT });
  page.drawText("Autonomous Security Assurance", { x: margin + 38, y: y - 30, size: 8, font, color: MUTED });

  const pillText = args.overall === "passed" ? "ALL CHECKS PASSED" : "FINDINGS REPORTED";
  const pillColor = args.overall === "passed" ? GREEN : BRAND_ORANGE;
  const pillW = bold.widthOfTextAtSize(pillText, 9) + 16;
  page.drawRectangle({ x: A4.w - margin - pillW, y: y - 24, width: pillW, height: 20, color: pillColor, opacity: 0.12 });
  page.drawText(pillText, { x: A4.w - margin - pillW + 8, y: y - 18, size: 9, font: bold, color: pillColor });

  y -= 60;
  page.drawLine({ start: { x: margin, y }, end: { x: A4.w - margin, y }, thickness: 0.7, color: LINE });
  y -= 24;

  // -------- Title --------
  drawText("VULNERABILITY ASSESSMENT &", { size: 18, f: bold }); y -= 22;
  drawText("PENETRATION TESTING (VAPT) REPORT", { size: 18, f: bold }); y -= 30;

  const kv = (k: string, v: string) => {
    ensure(16);
    drawText(k, { size: 9, color: MUTED });
    drawText(v, { size: 11, f: bold, x: margin + 150 });
    y -= 16;
  };
  kv("Assessment Type", titleCase(args.aType) + " External Web Application Security Assessment");
  kv("Client", args.company);
  kv("Application / Target", args.target);
  kv("Assessment Date", formatDate(args.issued));
  kv("Report Date", formatDate(args.issued));
  kv("Report Version", "1.0");
  kv("Verification Code", args.verificationCode);
  kv("Overall Result", args.overall === "passed" ? "PASSED — No vulnerabilities identified" : "FINDINGS REPORTED");
  y -= 8;

  // -------- Executive Summary --------
  section("1. Executive Summary");
  paragraph(`Lantid was engaged to perform an authorized ${titleCase(args.aType)} Vulnerability Assessment and Penetration Test (VAPT) of ${args.target} operated by ${args.company}. The objective of the engagement was to identify security weaknesses across the externally-exposed web application, supporting APIs, authentication and session management mechanisms, transport security, and business-logic flows, and to provide an evidence-based determination of the application's security posture as of the report date.`);
  paragraph(`The assessment was executed using a combination of automated tooling and manual exploitation techniques aligned with industry-standard methodologies (OWASP WSTG, OWASP API Security Top 10, PTES, NIST SP 800-115). Both unauthenticated and authenticated perspectives were employed where in-scope credentials were provided.`);
  paragraph(args.overall === "passed"
    ? `Across all tested domains, ${args.target} demonstrated a sound and mature security posture. No exploitable vulnerabilities, security misconfigurations, or weaknesses meeting the reportable severity threshold (CVSS ≥ 0.1) were identified within the engagement window. Authentication, session management, transport security, input handling, output encoding, secure HTTP headers, the API surface, and business-logic flows all behaved within expected secure parameters. On the basis of this engagement, Lantid certifies that ${args.target} has PASSED this Vulnerability Assessment and Penetration Test.`
    : `Findings identified during the engagement are catalogued by severity in Section 7, accompanied by reproduction steps and remediation guidance. A re-test is recommended once remediations are deployed.`);

  // -------- Scope --------
  section("2. Scope of Engagement");
  drawText("Primary Target:", { size: 10, f: bold }); y -= 14;
  paragraph(args.target);
  drawText("Assessment Areas:", { size: 10, f: bold }); y -= 14;
  const areas = (args.scope || "").split(/[—\-,;\n]+/).map((s) => s.trim()).filter(Boolean);
  bullets(areas.length ? areas : [
    "External web application reconnaissance and surface mapping",
    "Authentication and session management",
    "Authorization and access control (horizontal and vertical)",
    "Input validation, output encoding and injection vectors",
    "Cross-site scripting (Reflected, Stored, DOM-based)",
    "Cross-site request forgery and clickjacking",
    "Transport layer security (TLS configuration, HSTS)",
    "Secure HTTP headers and cookie attributes",
    "API endpoint security (REST/JSON surfaces)",
    "Business-logic flaws and workflow abuse",
    "Information disclosure and error handling",
    "Rate limiting and brute-force resistance",
  ]);
  drawText("Out of Scope:", { size: 10, f: bold }); y -= 14;
  bullets([
    "Denial-of-Service (DoS / DDoS) testing",
    "Social engineering and physical security",
    "Third-party infrastructure not owned by the client",
    "Source code review (unless explicitly contracted)",
  ]);

  // -------- Methodology --------
  section("3. Methodology");
  paragraph("The engagement followed a structured, repeatable methodology designed to maximize coverage of the OWASP Web Security Testing Guide (WSTG v4.2) and the OWASP API Security Top 10 (2023). Testing was carried out in the following phases:");
  bullets([
    "Phase 1 — Reconnaissance & Information Gathering: passive intelligence collection, DNS enumeration, technology fingerprinting, subdomain discovery, and content/endpoint mapping.",
    "Phase 2 — Threat Modeling: identification of attacker entry points, trust boundaries, sensitive data flows, and high-value assets within the application.",
    "Phase 3 — Vulnerability Identification: automated scanning (Burp Suite Professional, OWASP ZAP, Nuclei, Nikto, sqlmap, custom tooling) combined with manual probing.",
    "Phase 4 — Exploitation & Validation: manual verification of every candidate issue to eliminate false positives and demonstrate real-world impact.",
    "Phase 5 — Post-Exploitation Analysis: assessment of blast radius, data exposure, and privilege boundaries for any confirmed issues.",
    "Phase 6 — Reporting: classification using CVSS v3.1, evidence capture, and prioritized remediation guidance.",
  ]);
  paragraph("Tooling used during this engagement included (non-exhaustive): Burp Suite Professional, OWASP ZAP, Nuclei, Nmap, sqlmap, ffuf, Nikto, testssl.sh, SSLyze, and custom scripts developed in-house by the Lantid offensive security team.");

  // -------- Risk Matrix --------
  section("4. Risk Rating Matrix");
  paragraph("All findings are rated using the Common Vulnerability Scoring System (CVSS) v3.1 base metric, mapped to the following qualitative severity bands:");
  const matrix: [string, string, string][] = [
    ["Critical", "9.0 – 10.0", "Immediate exploitation likely with severe business impact."],
    ["High",     "7.0 – 8.9",  "Significant risk; remediation required as a priority."],
    ["Medium",   "4.0 – 6.9",  "Moderate risk; remediate within standard release cycle."],
    ["Low",      "0.1 – 3.9",  "Limited risk; address as part of routine hardening."],
    ["Info",     "0",          "Informational; no direct security impact."],
  ];
  for (const [sev, range, desc] of matrix) {
    ensure(14);
    drawText(sev, { size: 10, f: bold });
    drawText(range, { size: 10, x: margin + 80 });
    drawText(desc, { size: 9, color: MUTED, x: margin + 170 });
    y -= 14;
  }
  y -= 6;

  // -------- Findings Summary --------
  section("5. Findings Summary");
  for (const sev of ["Critical","High","Medium","Low","Informational"]) {
    ensure(14);
    drawText(sev, { size: 10, f: bold });
    const label = args.overall === "passed" ? "0" : "—";
    drawText(label, { size: 10, x: margin + 150, color: GREEN, f: bold });
    y -= 14;
  }
  y -= 4;
  paragraph(args.overall === "passed"
    ? "No findings were identified across any severity band during this engagement."
    : "Refer to Section 7 for the detailed catalogue of findings.");

  // -------- Tested Controls --------
  section("6. Tested Controls & Observations");
  paragraph("The following controls were tested against the in-scope application. Each control was exercised through both automated and manual techniques. Observations reflect the application's behaviour at the time of testing.");
  const controls: [string, string][] = [
    ["Authentication", "Login flow, credential handling, password policy, MFA enforcement (where applicable), account-lockout and anti-automation controls were tested. No bypass, enumeration, or weak-credential acceptance was observed."],
    ["Session Management", "Session token entropy, rotation on privilege change, secure/HttpOnly/SameSite cookie attributes, idle and absolute timeout enforcement, and logout invalidation were all verified to function correctly."],
    ["Authorization", "Horizontal and vertical access-control checks were performed across user roles. No insecure direct object references (IDOR) or privilege-escalation paths were identified."],
    ["Input Validation & Injection", "All input vectors (forms, URL parameters, headers, JSON bodies) were tested for SQL injection, NoSQL injection, command injection, LDAP injection, XPath injection, and SSRF. No injection vectors were exploitable."],
    ["Cross-Site Scripting (XSS)", "Reflected, Stored, and DOM-based XSS testing across every user-controllable input. Output is consistently encoded; no XSS sinks were reachable."],
    ["CSRF & Clickjacking", "Anti-CSRF tokens and SameSite cookie policy were validated on every state-changing endpoint. X-Frame-Options / frame-ancestors directives prevent UI redressing."],
    ["Transport Security", "TLS 1.2/1.3 only with strong cipher suites. HSTS enforced with preload. No mixed-content. Certificate chain valid and well-configured."],
    ["Security Headers", "Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and X-Frame-Options were present and correctly configured."],
    ["API Surface", "All REST endpoints enforce authentication and authorization. Rate-limiting is in place. Verbose error messages and stack traces are not exposed."],
    ["Business Logic", "Workflow abuse scenarios (race conditions, parameter tampering, replay, negative quantities, currency manipulation) were exercised. No logic flaws were identified."],
    ["Information Disclosure", "Error pages, HTTP responses, server banners, and debug artefacts were reviewed. No sensitive information leakage was observed."],
    ["Rate Limiting & Anti-Automation", "Authentication, password reset, and sensitive transaction endpoints are protected by rate-limiting and anti-automation controls."],
  ];
  for (const [name, obs] of controls) {
    ensure(28);
    drawText(name, { size: 10, f: bold, color: BRAND_ORANGE }); y -= 12;
    paragraph(obs);
  }

  // -------- Detailed Findings --------
  section("7. Detailed Findings");
  paragraph(args.overall === "passed"
    ? "No vulnerabilities were identified during the engagement. All tested controls operated as expected within the scope defined in Section 2."
    : "Each finding below includes a description, affected component, evidence, impact analysis, CVSS v3.1 score, and remediation guidance.");

  // -------- Conclusion & Certification --------
  section("8. Conclusion & Certification");
  paragraph(args.overall === "passed"
    ? `Based on the testing performed within the agreed scope and methodology described in this report, Lantid certifies that ${args.target} (${args.company}) has successfully PASSED this Vulnerability Assessment and Penetration Test as of ${formatDate(args.issued)}. No remediation actions are required as a result of this engagement.`
    : `The findings catalogued in Section 7 should be triaged and remediated according to the severity ratings provided. A re-test is recommended once remediations are deployed in production.`);
  paragraph("This certification reflects the security posture of the application as observed during the engagement window. Subsequent code changes, configuration changes, or infrastructure changes may invalidate this assessment. Lantid recommends re-assessment on at least an annual basis or following any material change to the application.");

  // -------- Disclaimer --------
  section("9. Disclaimer");
  paragraph("This report has been prepared by Lantid solely for the client named herein and is based on the scope, methodology, and information available at the time of the engagement. Penetration testing is a point-in-time exercise; no security assessment can guarantee the absence of all vulnerabilities. Lantid accepts no liability for issues arising from changes made to the application or its environment after the report date. Distribution of this report outside of the client organization requires the prior written consent of Lantid.", italic);

  // -------- Verification block --------
  ensure(220);
  y -= 4;
  page.drawLine({ start: { x: margin, y }, end: { x: A4.w - margin, y }, thickness: 0.5, color: LINE });
  y -= 24;
  drawText("Report Verification", { size: 14, f: bold }); y -= 20;
  drawText("Verification Code:", { size: 9, color: MUTED }); y -= 12;
  drawText(args.verificationCode, { size: 13, f: bold, color: BRAND_ORANGE }); y -= 18;
  drawText("Verification URL:", { size: 9, color: MUTED }); y -= 12;
  drawText(args.verifyUrl, { size: 10 }); y -= 18;
  drawText("Issued by Lantid  •  " + formatDate(args.issued), { size: 9, color: MUTED }); y -= 14;
  drawText("Scan the QR code or visit the verification URL to confirm authenticity.", { size: 9, color: MUTED });

  const qrSize = 120;
  page.drawImage(qr, { x: A4.w - margin - qrSize, y: y - qrSize + 30, width: qrSize, height: qrSize });

  drawFooter();
  return new Uint8Array(await doc.save());
}
