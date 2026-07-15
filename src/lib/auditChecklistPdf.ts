import jsPDF from "jspdf";
import { AuditServiceDef, TIERS, VAT_RATE, formatNaira } from "@/config/audits";

/**
 * Generate a printable "what you need to bring" checklist PDF for a given audit.
 * Includes org profile fields, engagement questions, and every required document,
 * with checkboxes users can tick off internally before uploading.
 */
export function generateAuditChecklistPdf(audit: AuditServiceDef) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // Brand strip
  doc.setFillColor(255, 122, 0);
  doc.rect(0, 0, pageW, 6, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text("Lantid — Audit Intake Checklist", margin, y + 18);
  y += 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(audit.name, margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Standard: ${audit.standard}`, margin, y);
  y += 12;

  const base = TIERS.standard.baseKobo;
  const vat = Math.round(base * VAT_RATE);
  const total = base + vat;
  const pricingLine = `From ${formatNaira(base)} + 7.5% VAT (${formatNaira(vat)}) = ${formatNaira(total)}. Standard 3 business days · Priority 24h · Expedited 6h.`;
  const pricingLines = doc.splitTextToSize(pricingLine, pageW - margin * 2);
  doc.text(pricingLines, margin, y);
  y += pricingLines.length * 11 + 8;

  // Intro card
  doc.setFillColor(252, 246, 236);
  doc.setDrawColor(255, 200, 140);
  doc.roundedRect(margin, y, pageW - margin * 2, 46, 6, 6, "FD");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  const intro =
    "Prepare the items below before starting your intake. Items marked REQUIRED block engagement kickoff. " +
    "Every upload is encrypted at rest and only accessible to your account and the assigned Lantid audit team. " +
    "NDA available on request before evidence exchange.";
  const introLines = doc.splitTextToSize(intro, pageW - margin * 2 - 16);
  doc.text(introLines, margin + 8, y + 14);
  y += 60;

  // Outcomes
  ensure(30 + audit.outcomes.length * 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("What you will receive", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  audit.outcomes.forEach((o) => {
    const lines = doc.splitTextToSize(`• ${o}`, pageW - margin * 2 - 8);
    ensure(lines.length * 11);
    doc.text(lines, margin + 6, y);
    y += lines.length * 11;
  });
  y += 10;

  // Sections
  audit.sections?.forEach((section) => {
    const docCount = section.fields.filter((f) => f.type === "file").length;
    const reqCount = section.fields.filter((f) => f.required).length;

    ensure(50);
    doc.setFillColor(20, 20, 20);
    doc.rect(margin, y, pageW - margin * 2, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(section.title.toUpperCase(), margin + 10, y + 15);

    // meta on the right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(230, 230, 230);
    const meta = `${section.fields.length} items · ${reqCount} required${docCount ? ` · ${docCount} docs` : ""}`;
    doc.text(meta, pageW - margin - 10, y + 15, { align: "right" });
    y += 30;

    if (section.description) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const lines = doc.splitTextToSize(section.description, pageW - margin * 2);
      ensure(lines.length * 10 + 6);
      doc.text(lines, margin, y);
      y += lines.length * 10 + 8;
    }

    section.fields.forEach((f) => {
      const isDoc = f.type === "file";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      const labelText = f.label;
      const wrapped = doc.splitTextToSize(labelText, pageW - margin * 2 - 60);
      const helperLines = f.helper
        ? doc.splitTextToSize(f.helper, pageW - margin * 2 - 32)
        : [];
      const blockHeight = wrapped.length * 11 + helperLines.length * 9 + 6;
      ensure(blockHeight);

      // checkbox
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.6);
      doc.rect(margin, y - 8, 10, 10);

      // DOC / REQ tags
      let xOffset = margin + 18;
      if (isDoc) {
        doc.setFillColor(255, 122, 0);
        doc.roundedRect(xOffset, y - 8, 24, 10, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text("DOC", xOffset + 12, y - 1, { align: "center" });
        xOffset += 28;
      }
      if (f.required) {
        doc.setFillColor(40, 40, 40);
        doc.roundedRect(xOffset, y - 8, 32, 10, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text("REQUIRED", xOffset + 16, y - 1, { align: "center" });
        xOffset += 36;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      doc.text(wrapped, xOffset, y);
      y += wrapped.length * 11;

      if (helperLines.length) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(130, 130, 130);
        doc.text(helperLines, margin + 18, y);
        y += helperLines.length * 9;
      }
      y += 4;
    });
    y += 8;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Lantid · ${audit.name} intake checklist · Page ${p} of ${totalPages}`,
      margin,
      pageH - 20,
    );
    doc.text("lantid.com", pageW - margin, pageH - 20, { align: "right" });
  }

  doc.save(`Lantid-${audit.slug}-checklist.pdf`);
}
