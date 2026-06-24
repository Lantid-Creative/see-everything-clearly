// Admin-only: generate a VAPT PDF report (with QR + verification code), upload to private bucket,
// compute SHA-256 hash, and create/update the report row.
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

type Finding = { severity: string; title: string; description: string; cvss?: number; recommendation?: string };
type ReportInput = {
  report_id?: string;
  request_id?: string | null;
  company_name: string;
  target: string;
  scope_summary: string;
  assessment_type: "basic" | "standard" | "advanced";
  verification_code?: string;
  issued_at?: string;
  overall_result: "passed" | "findings";
  findings?: Finding[];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Admin only" }, 403);

    const body = (await req.json()) as ReportInput;

    // Resolve / create the report row
    let reportRow: Record<string, unknown> | null = null;
    if (body.report_id) {
      const { data } = await admin.from("reports").select("*").eq("id", body.report_id).single();
      reportRow = data as Record<string, unknown> | null;
    }
    const code =
      (reportRow?.verification_code as string | undefined) ||
      body.verification_code ||
      generateCode();

    const company = body.company_name || (reportRow?.company_name as string) || "Unknown";
    const target = body.target || (reportRow?.target as string) || "";
    const scope = body.scope_summary || (reportRow?.scope_summary as string) || "";
    const aType = body.assessment_type || (reportRow?.assessment_type as ReportInput["assessment_type"]) || "standard";
    const overall = body.overall_result || (reportRow?.overall_result as ReportInput["overall_result"]) || "passed";
    const issued = body.issued_at || (reportRow?.issued_at as string) || new Date().toISOString();
    const findings = body.findings ?? [];

    const verifyUrl = `https://lantid.com/verify-report/${code}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 320 });
    const qrPngBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]), (c) => c.charCodeAt(0));

    const pdfBytes = await buildPdf({
      company, target, scope, aType, overall, issued, findings,
      verificationCode: code, verifyUrl, qrPngBytes,
    });

    // Compute SHA-256
    const hashBuf = await crypto.subtle.digest("SHA-256", pdfBytes);
    const hashHex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

    // Upload to private bucket
    const path = `${code}.pdf`;
    const { error: upErr } = await admin.storage.from("reports").upload(path, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upErr) throw upErr;

    // Upsert report row
    let finalReport;
    if (reportRow?.id) {
      const { data, error } = await admin.from("reports").update({
        company_name: company, target, scope_summary: scope, assessment_type: aType,
        overall_result: overall, storage_path: path, sha256_hash: hashHex, issued_at: issued, status: "issued",
      }).eq("id", reportRow.id as string).select().single();
      if (error) throw error;
      finalReport = data;
    } else {
      const { data, error } = await admin.from("reports").insert({
        request_id: body.request_id ?? null,
        verification_code: code,
        company_name: company, target, scope_summary: scope, assessment_type: aType,
        overall_result: overall, storage_path: path, sha256_hash: hashHex, issued_at: issued, status: "issued",
      }).select().single();
      if (error) throw error;
      finalReport = data;
    }

    // Mark related request as completed
    if (finalReport?.request_id) {
      await admin.from("vapt_requests").update({ status: "completed" }).eq("id", finalReport.request_id);
    }

    await admin.from("audit_logs").insert({
      actor_id: user.id, action: "generate_report",
      entity_type: "report", entity_id: finalReport.id,
      metadata: { verification_code: code, sha256: hashHex },
    });

    return json({ report: finalReport, sha256: hashHex });
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

function generateCode() {
  const rand = crypto.getRandomValues(new Uint8Array(4));
  const tail = Array.from(rand).map((b) => b.toString(16)).join("").toUpperCase().slice(0, 6);
  return `LNTD-VAPT-${new Date().getFullYear()}-${tail}`;
}

async function buildPdf(args: {
  company: string; target: string; scope: string;
  aType: string; overall: string; issued: string;
  findings: Finding[];
  verificationCode: string; verifyUrl: string; qrPngBytes: Uint8Array;
}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
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

  // ---------- Header / Logo ----------
  // Orange square mark + "LANTID" wordmark
  page.drawRectangle({ x: margin, y: y - 28, width: 28, height: 28, color: BRAND_ORANGE });
  page.drawText("L", { x: margin + 8, y: y - 22, size: 18, font: bold, color: rgb(1,1,1) });
  page.drawText("LANTID", { x: margin + 38, y: y - 18, size: 18, font: bold, color: TEXT });
  page.drawText("Autonomous Security Assurance", { x: margin + 38, y: y - 30, size: 8, font, color: MUTED });

  // Right-side status pill
  const pillText = args.overall === "passed" ? "ALL CHECKS PASSED" : "FINDINGS REPORTED";
  const pillColor = args.overall === "passed" ? GREEN : BRAND_ORANGE;
  const pillW = bold.widthOfTextAtSize(pillText, 9) + 16;
  page.drawRectangle({ x: A4.w - margin - pillW, y: y - 24, width: pillW, height: 20, color: pillColor, opacity: 0.12 });
  page.drawText(pillText, { x: A4.w - margin - pillW + 8, y: y - 18, size: 9, font: bold, color: pillColor });

  y -= 60;
  page.drawLine({ start: { x: margin, y }, end: { x: A4.w - margin, y }, thickness: 0.7, color: LINE });
  y -= 24;

  // ---------- Title block ----------
  drawText("VULNERABILITY ASSESSMENT &", { size: 18, f: bold });
  y -= 22;
  drawText("PENETRATION TESTING (VAPT) REPORT", { size: 18, f: bold });
  y -= 30;

  const kv = (k: string, v: string) => {
    ensure(16);
    drawText(k, { size: 9, color: MUTED });
    drawText(v, { size: 11, f: bold, x: margin + 130 });
    y -= 16;
  };
  kv("Assessment Type", titleCase(args.aType) + " External Web Application Security Assessment");
  kv("Company", args.company);
  kv("Application / Target", args.target);
  kv("Assessment Date", formatDate(args.issued));
  kv("Report Date", formatDate(args.issued));
  kv("Report Version", "1.0");
  kv("Verification Code", args.verificationCode);
  kv("Overall Result", args.overall === "passed" ? "PASSED — No vulnerabilities identified" : "FINDINGS REPORTED");

  y -= 12;

  // ---------- Executive Summary ----------
  section("Executive Summary");
  const summary = args.overall === "passed"
    ? `Lantid conducted an authorized ${titleCase(args.aType)} Vulnerability Assessment and Penetration Test against ${args.target}. The engagement covered the assessment areas listed in the Scope section below. Across all tested domains, the application demonstrated a sound security posture: no exploitable vulnerabilities, misconfigurations, or weaknesses meeting the reportable severity threshold were identified during the engagement window. Authentication, session management, transport security, input handling, secure headers, API surface, and business-logic flows all behaved within expected secure parameters. The platform is therefore certified by Lantid as having passed this assessment.`
    : `Lantid conducted an authorized ${titleCase(args.aType)} Vulnerability Assessment and Penetration Test against ${args.target}. Findings identified during the engagement are detailed in the sections below, classified by severity and accompanied by remediation guidance.`;
  paragraph(summary);

  // ---------- Scope ----------
  section("Scope");
  drawText("Target:", { size: 10, f: bold }); y -= 14;
  paragraph(args.target);
  drawText("Assessment Areas:", { size: 10, f: bold }); y -= 14;
  const areas = args.scope.split(/[—\-,;]+/).map((s) => s.trim()).filter(Boolean);
  for (const a of (areas.length ? areas : [args.scope])) {
    ensure(14);
    drawText(`•  ${a}`, { size: 10 });
    y -= 14;
  }
  y -= 6;

  // ---------- Methodology ----------
  section("Methodology");
  paragraph("The engagement followed industry-standard methodologies including the OWASP Web Security Testing Guide (WSTG), OWASP Top 10, PTES (Penetration Testing Execution Standard), NIST SP 800-115, and the CVSS v3.1 scoring framework. Both authenticated and unauthenticated testing perspectives were employed where applicable.");

  // ---------- Risk Matrix ----------
  section("Risk Rating Matrix");
  const matrix: [string, string][] = [
    ["Critical", "9.0 – 10.0"], ["High", "7.0 – 8.9"],
    ["Medium", "4.0 – 6.9"], ["Low", "0.1 – 3.9"], ["Informational", "0"],
  ];
  for (const [sev, range] of matrix) {
    ensure(14);
    drawText(sev, { size: 10, f: bold });
    drawText(range, { size: 10, x: margin + 140 });
    y -= 14;
  }
  y -= 6;

  // ---------- Findings Summary ----------
  section("Findings Summary");
  const counts = countFindings(args.findings);
  for (const sev of ["Critical","High","Medium","Low","Informational"] as const) {
    ensure(14);
    drawText(sev, { size: 10, f: bold });
    const n = counts[sev] || 0;
    const label = args.overall === "passed" ? "0" : String(n);
    drawText(label, { size: 10, x: margin + 140, color: n > 0 ? BRAND_ORANGE : GREEN, f: bold });
    y -= 14;
  }
  y -= 8;

  // ---------- Detailed Findings ----------
  section("Detailed Findings");
  if (args.overall === "passed" || args.findings.length === 0) {
    paragraph("No vulnerabilities were identified during the engagement. All tested controls operated as expected within the scope defined above.");
  } else {
    for (const f of args.findings) {
      ensure(60);
      drawText(`[${f.severity.toUpperCase()}] ${f.title}`, { size: 11, f: bold, color: BRAND_ORANGE }); y -= 16;
      if (typeof f.cvss === "number") { drawText(`CVSS v3.1: ${f.cvss.toFixed(1)}`, { size: 9, color: MUTED }); y -= 12; }
      paragraph(f.description);
      if (f.recommendation) { drawText("Recommendation:", { size: 10, f: bold }); y -= 14; paragraph(f.recommendation); }
      y -= 6;
    }
  }

  // ---------- Conclusion ----------
  section("Conclusion");
  paragraph(args.overall === "passed"
    ? `Based on the testing performed within the agreed scope and methodology, Lantid certifies that ${args.target} (${args.company}) successfully passed this Vulnerability Assessment and Penetration Test. No remediation actions are required as a result of this engagement.`
    : `The findings above should be triaged and remediated according to the severity ratings provided. A re-test is recommended once remediations are in place.`);

  // ---------- Verification block (always last page) ----------
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
  drawText("Scan the QR code or visit the verification URL to confirm authenticity.", { size: 9, color: MUTED }); y -= 6;

  // QR on the right
  const qrSize = 120;
  page.drawImage(qr, { x: A4.w - margin - qrSize, y: y - qrSize + 30, width: qrSize, height: qrSize });

  drawFooter();
  return new Uint8Array(await doc.save());

  // -------- helpers (closures) --------
  function section(title: string) {
    ensure(28);
    y -= 6;
    drawText(title, { size: 13, f: bold, color: BRAND_ORANGE });
    y -= 4;
    page.drawLine({ start: { x: margin, y }, end: { x: A4.w - margin, y }, thickness: 0.5, color: LINE });
    y -= 14;
  }
  function paragraph(text: string) {
    const maxW = A4.w - margin * 2;
    const size = 10;
    const lh = 14;
    const words = text.split(/\s+/);
    let line = "";
    const flush = () => { ensure(lh); drawText(line, { size }); y -= lh; line = ""; };
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxW) { flush(); line = w; } else line = test;
    }
    if (line) flush();
    y -= 4;
  }
}

function countFindings(fs: Finding[]) {
  const out: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
  for (const f of fs) {
    const k = titleCase(f.severity);
    if (k in out) out[k]++;
  }
  return out;
}
function titleCase(s: string) { return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s; }
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
