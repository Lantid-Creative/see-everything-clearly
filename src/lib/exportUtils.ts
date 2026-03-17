import type { ChatMessage } from "@/hooks/useConversations";

/** Export chat messages as a Markdown file */
export function exportChatAsMarkdown(title: string, messages: ChatMessage[]) {
  const lines = [`# ${title}`, `_Exported from Lantid on ${new Date().toLocaleDateString()}_`, ""];

  for (const msg of messages) {
    if (msg.isStreaming) continue;
    const label = msg.role === "user" ? "**You**" : "**Lantid**";
    lines.push(`### ${label}`);
    lines.push(msg.content);
    lines.push("");
  }

  downloadFile(`${sanitizeFilename(title)}.md`, lines.join("\n"), "text/markdown");
}

/** Export data as CSV */
export function exportAsCSV(filename: string, headers: string[], rows: string[][]) {
  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ];

  downloadFile(`${sanitizeFilename(filename)}.csv`, lines.join("\n"), "text/csv");
}

export interface ExportSlide {
  title: string;
  subtitle?: string;
  bullets?: string[];
}

/** Export slides as Markdown presentation */
export function exportSlidesAsMarkdown(slides: ExportSlide[]) {
  const lines = ["# Presentation", `_Exported from Lantid on ${new Date().toLocaleDateString()}_`, ""];

  slides.forEach((slide, i) => {
    lines.push(`---`);
    lines.push(`## Slide ${i + 1}: ${slide.title}`);
    if (slide.subtitle) lines.push(`*${slide.subtitle}*`);
    if (slide.bullets) {
      lines.push("");
      slide.bullets.forEach((b) => lines.push(`- ${b}`));
    }
    lines.push("");
  });

  downloadFile("presentation.md", lines.join("\n"), "text/markdown");
}

/** Export slides as PowerPoint (.pptx) */
export async function exportSlidesAsPPTX(slides: ExportSlide[]) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  for (const slide of slides) {
    const pptSlide = pptx.addSlide();

    // Accent bar at top
    pptSlide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.15, fill: { color: "4F46E5" },
    });

    // Title
    pptSlide.addText(slide.title, {
      x: 0.8, y: slide.subtitle ? 1.0 : 1.5, w: 11.5, h: 1,
      fontSize: 32, bold: true, color: "1a1a2e",
      fontFace: "Arial",
    });

    // Subtitle
    if (slide.subtitle) {
      pptSlide.addText(slide.subtitle, {
        x: 0.8, y: 2.0, w: 11.5, h: 0.6,
        fontSize: 18, color: "6b7280", fontFace: "Arial",
      });
    }

    // Bullets
    if (slide.bullets && slide.bullets.length > 0) {
      const startY = slide.subtitle ? 2.8 : 2.8;
      pptSlide.addText(
        slide.bullets.map((b) => ({
          text: b,
          options: { bullet: true, fontSize: 16, color: "374151", paraSpaceAfter: 8 },
        })),
        { x: 1.0, y: startY, w: 11, h: 4, fontFace: "Arial", valign: "top" }
      );
    }
  }

  await pptx.writeFile({ fileName: "presentation.pptx" });
}

/** Export slides as PDF */
export async function exportSlidesAsPDF(slides: ExportSlide[]) {
  const { jsPDF } = await import("jspdf");
  // Landscape 16:9
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: [960, 540] });

  slides.forEach((slide, i) => {
    if (i > 0) pdf.addPage([960, 540], "landscape");

    // Accent bar
    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 0, 960, 8, "F");

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(26, 26, 46);
    const titleY = slide.subtitle ? 80 : 120;
    pdf.text(slide.title, 50, titleY, { maxWidth: 860 });

    // Subtitle
    if (slide.subtitle) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(16);
      pdf.setTextColor(107, 114, 128);
      pdf.text(slide.subtitle, 50, titleY + 40, { maxWidth: 860 });
    }

    // Bullets
    if (slide.bullets && slide.bullets.length > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.setTextColor(55, 65, 81);
      const startY = slide.subtitle ? titleY + 80 : titleY + 50;
      slide.bullets.forEach((b, bi) => {
        pdf.text(`•  ${b}`, 60, startY + bi * 28, { maxWidth: 840 });
      });
    }

    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(156, 163, 175);
    pdf.text(`Slide ${i + 1}`, 910, 525, { align: "right" });
  });

  pdf.save("presentation.pdf");
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-").slice(0, 50) || "export";
}
