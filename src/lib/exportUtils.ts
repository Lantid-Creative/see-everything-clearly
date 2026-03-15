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

/** Export slides as Markdown presentation */
export function exportSlidesAsMarkdown(slides: { title: string; subtitle?: string; bullets?: string[] }[]) {
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
