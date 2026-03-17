import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, MessageSquare, Edit3, Plus, Loader2, Sparkles, Download, Trash2, Send, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { exportSlidesAsMarkdown, exportSlidesAsPPTX, exportSlidesAsPDF } from "@/lib/exportUtils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  layout: "title" | "content" | "two-column" | "image";
  brandColor: string;
  clientLogo?: string;
  comments?: { text: string; resolved: boolean }[];
}

const defaultSlides: Slide[] = [
  { id: "1", title: "ClosedAI × Draft", subtitle: "Partnership Proposal", layout: "title", brandColor: "hsl(var(--primary))" },
  { id: "2", title: "About ClosedAI", bullets: ["AI-powered sales intelligence platform", "10x faster lead research & enrichment", "Trusted by 500+ B2B companies", "SOC2 Type II certified"], layout: "content", brandColor: "hsl(var(--primary))" },
  { id: "3", title: "Why Draft + ClosedAI?", bullets: ["Draft's developer audience aligns with ClosedAI's ICP", "Joint content marketing amplifies both brands", "Technical credibility through authentic developer voices", "Shared vision: democratize AI tools for builders"], layout: "content", brandColor: "hsl(var(--primary))" },
  { id: "4", title: "Proposed Partnership", bullets: ["Co-branded case study series (3 articles)", "Guest post exchange program", "Joint webinar: 'AI for Developer Productivity'", "Revenue share on referred customers"], layout: "content", brandColor: "hsl(var(--primary))" },
  { id: "5", title: "Next Steps", bullets: ["30-min alignment call this week", "Draft partnership agreement", "Launch first co-branded content in 2 weeks", "Measure & iterate monthly"], layout: "content", brandColor: "hsl(var(--primary))" },
];

interface SlideEditorViewProps {
  onBack: () => void;
  initialContent?: string | null;
  onContentConsumed?: () => void;
}

function parseAIContentToSlides(content: string): Slide[] | null {
  // Split content by slide headers like "**Slide 1:**", "Slide 1:", etc.
  const sections = content.split(/(?=\*{0,2}Slide\s+\d+\*{0,2}\s*[:\s—–-])/i);
  const slides: Slide[] = [];

  for (const section of sections) {
    // Match the slide header
    const headerMatch = section.match(/\*{0,2}Slide\s+(\d+)\*{0,2}\s*[:\s—–-]+\s*\*{0,2}(.+?)\*{0,2}\s*$/im);
    if (!headerMatch) continue;

    const title = headerMatch[2].replace(/\*\*/g, '').replace(/[-—–]\s*$/, '').trim();
    
    // Extract bullets from the rest of the section
    const restOfSection = section.slice(headerMatch.index! + headerMatch[0].length);
    const bullets = restOfSection
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '').trim())
      .filter(line => line.length > 0 && !line.match(/^\*?\*?Slide\s+\d/i) && !line.match(/^\[\[action:/));

    slides.push({
      id: Date.now().toString() + slides.length,
      title,
      bullets: bullets.length > 0 ? bullets : undefined,
      layout: slides.length === 0 ? "title" as const : "content" as const,
      brandColor: "hsl(var(--primary))",
    });
  }

  return slides.length >= 2 ? slides : null;
}

export function SlideEditorView({ onBack, initialContent, onContentConsumed }: SlideEditorViewProps) {
  const [slides, setSlides] = useState<Slide[]>(() => {
    if (initialContent) {
      const parsed = parseAIContentToSlides(initialContent);
      if (parsed && parsed.length > 0) return parsed;
    }
    return defaultSlides;
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // When new initialContent arrives, parse and apply it
  useEffect(() => {
    if (initialContent) {
      const parsed = parseAIContentToSlides(initialContent);
      if (parsed && parsed.length > 0) {
        setSlides(parsed);
        setCurrentSlide(0);
        toast({ title: "Deck created", description: `${parsed.length} slides generated from AI` });
      }
      onContentConsumed?.();
    }
  }, [initialContent]);

  const slide = slides[currentSlide];

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (!editingField) return;
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== currentSlide) return s;
        if (editingField === "title") return { ...s, title: editValue };
        if (editingField === "subtitle") return { ...s, subtitle: editValue };
        if (editingField.startsWith("bullet-")) {
          const idx = parseInt(editingField.split("-")[1]);
          const bullets = [...(s.bullets || [])];
          bullets[idx] = editValue;
          return { ...s, bullets };
        }
        return s;
      })
    );
    setEditingField(null);
  };

  const addBullet = () => {
    setSlides((prev) =>
      prev.map((s, i) =>
        i === currentSlide ? { ...s, bullets: [...(s.bullets || []), "New bullet point"] } : s
      )
    );
  };

  const removeBullet = (bulletIdx: number) => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== currentSlide) return s;
        const bullets = [...(s.bullets || [])];
        bullets.splice(bulletIdx, 1);
        return { ...s, bullets };
      })
    );
  };

  const addSlide = (afterIndex?: number) => {
    const idx = afterIndex ?? slides.length;
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: "New Slide",
      bullets: ["Add your content here"],
      layout: "content",
      brandColor: "hsl(var(--primary))",
    };
    const updated = [...slides];
    updated.splice(idx + 1, 0, newSlide);
    setSlides(updated);
    setCurrentSlide(idx + 1);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast({ title: "Can't delete", description: "You need at least one slide." });
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    if (currentSlide >= updated.length) setCurrentSlide(updated.length - 1);
    else if (currentSlide > index) setCurrentSlide(currentSlide - 1);
  };

  const addComment = () => {
    if (!commentInput.trim()) return;
    setSlides((prev) =>
      prev.map((s, i) =>
        i === currentSlide
          ? { ...s, comments: [...(s.comments || []), { text: commentInput, resolved: false }] }
          : s
      )
    );
    setCommentInput("");
    toast({ title: "Comment added", description: "Lantid will address your feedback." });
  };

  const applyAIChanges = (aiText: string) => {
    // Try to parse AI response for slide modifications
    const titleMatch = aiText.match(/(?:title|heading):\s*["']?(.+?)["']?\s*(?:\n|$)/i);
    const bulletMatches = [...aiText.matchAll(/[-•]\s*(.+)/g)];

    if (titleMatch || bulletMatches.length > 0) {
      setSlides((prev) =>
        prev.map((s, i) => {
          if (i !== currentSlide) return s;
          const updated = { ...s };
          if (titleMatch) updated.title = titleMatch[1].trim();
          if (bulletMatches.length > 0) {
            updated.bullets = bulletMatches.map((m) => m[1].trim());
          }
          return updated;
        })
      );
      return true;
    }
    return false;
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isGenerating) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput("");
    setIsGenerating(true);

    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    let fullContent = "";

    try {
      await streamChat({
        messages: [
          {
            role: "system",
            content: `You are Lantid, a slide editor AI. The user is editing slide ${currentSlide + 1}/${slides.length}.
Current slide title: "${slide.title}"
Current bullets: ${slide.bullets?.map((b, i) => `${i + 1}. ${b}`).join(", ") || "none"}

When the user asks to change content, respond with the updated content in this format:
Title: <new title>
- bullet 1
- bullet 2
- bullet 3

If they ask a question without requesting changes, just answer naturally. Always be concise.`,
          },
          { role: "user", content: currentInput },
        ],
        onDelta: (chunk) => {
          fullContent += chunk;
          setChatMessages((prev) => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { role: "assistant", content: fullContent };
            return msgs;
          });
        },
        onDone: () => {
          // Try to apply changes from AI response
          applyAIChanges(fullContent);
        },
      });
    } catch {
      setChatMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { role: "assistant", content: "I'll address that feedback on the slide." };
        return msgs;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center px-4 border-b shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <button onClick={onBack} className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Slide Editor</h1>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {currentSlide + 1}/{slides.length} slides
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSlidesAsMarkdown(slides)}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`h-7 px-2 rounded-md text-xs flex items-center gap-1 transition-colors ${showComments ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Comments
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Slide thumbnails */}
        {!isMobile && (
          <div className="w-[140px] border-r overflow-y-auto p-2 space-y-2 shrink-0">
            {slides.map((s, i) => (
              <div key={s.id} className="relative group">
                <button
                  onClick={() => setCurrentSlide(i)}
                  className={`w-full aspect-[16/9] rounded-lg border-2 p-2 text-left transition-colors ${
                    i === currentSlide ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <p className="text-[7px] font-semibold text-foreground truncate">{s.title}</p>
                  {s.subtitle && <p className="text-[6px] text-muted-foreground truncate">{s.subtitle}</p>}
                  {s.comments && s.comments.length > 0 && (
                    <div className="mt-1 flex items-center gap-0.5">
                      <MessageSquare className="h-2 w-2 text-primary" />
                      <span className="text-[6px] text-primary">{s.comments.length}</span>
                    </div>
                  )}
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={() => deleteSlide(i)}
                    className="absolute top-1 right-1 h-4 w-4 rounded bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addSlide(slides.length - 1)}
              className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-border hover:border-primary/40 flex items-center justify-center transition-colors hover:bg-primary/5"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Main slide view */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-muted/30">
          <div className="w-full max-w-3xl aspect-[16/9] bg-background rounded-xl shadow-lg border overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-primary" />
            <div className="flex-1 p-8 flex flex-col justify-center">
              {slide.layout === "title" ? (
                <div className="text-center space-y-3">
                  {editingField === "title" ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      autoFocus
                      className="text-2xl font-bold text-foreground text-center w-full bg-transparent border-b-2 border-primary focus:outline-none"
                    />
                  ) : (
                    <h2
                      onClick={() => startEdit("title", slide.title)}
                      className="text-2xl font-bold text-foreground cursor-pointer hover:bg-primary/5 rounded-lg px-2 py-1 transition-colors group"
                    >
                      {slide.title}
                      <Edit3 className="h-3.5 w-3.5 inline ml-2 opacity-0 group-hover:opacity-50" />
                    </h2>
                  )}
                  {editingField === "subtitle" ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      autoFocus
                      className="text-base text-muted-foreground text-center w-full bg-transparent border-b border-primary focus:outline-none"
                    />
                  ) : (
                    <p
                      onClick={() => startEdit("subtitle", slide.subtitle || "")}
                      className="text-base text-muted-foreground cursor-pointer hover:bg-primary/5 rounded-lg px-2 py-1 transition-colors"
                    >
                      {slide.subtitle || "Click to add subtitle"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {editingField === "title" ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      autoFocus
                      className="text-lg font-bold text-foreground w-full bg-transparent border-b-2 border-primary focus:outline-none"
                    />
                  ) : (
                    <h3
                      onClick={() => startEdit("title", slide.title)}
                      className="text-lg font-bold text-foreground cursor-pointer hover:bg-primary/5 rounded-lg px-2 py-1 transition-colors group"
                    >
                      {slide.title}
                      <Edit3 className="h-3 w-3 inline ml-2 opacity-0 group-hover:opacity-50" />
                    </h3>
                  )}
                  <ul className="space-y-2 pl-2">
                    {slide.bullets?.map((bullet, bi) => (
                      <li key={bi} className="flex items-start gap-2 group/bullet">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {editingField === `bullet-${bi}` ? (
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            autoFocus
                            className="flex-1 text-sm text-foreground bg-transparent border-b border-primary focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => startEdit(`bullet-${bi}`, bullet)}
                            className="text-sm text-foreground cursor-pointer hover:bg-primary/5 rounded px-1 transition-colors flex-1"
                          >
                            {bullet}
                          </span>
                        )}
                        <button
                          onClick={() => removeBullet(bi)}
                          className="h-4 w-4 rounded hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover/bullet:opacity-100 transition-opacity shrink-0 mt-0.5"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-destructive" />
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={addBullet}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 pl-1 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Add bullet
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="px-6 py-2 flex items-center justify-between border-t">
              <span className="text-[9px] text-muted-foreground font-medium">ClosedAI</span>
              <span className="text-[9px] text-muted-foreground">Slide {currentSlide + 1}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {isMobile && (
              <button
                onClick={() => addSlide(currentSlide)}
                className="h-8 px-3 rounded-full border flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            )}
            <span className="text-xs text-muted-foreground">
              {currentSlide + 1} / {slides.length}
            </span>
            {isMobile && slides.length > 1 && (
              <button
                onClick={() => deleteSlide(currentSlide)}
                className="h-8 px-3 rounded-full border flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Comments & Chat Panel */}
        {showComments && !isMobile && (
          <div className="w-[280px] border-l flex flex-col shrink-0">
            <div className="px-4 py-2.5 border-b">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Comments</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {(slide.comments || []).map((c, i) => (
                <div key={i} className="bg-secondary rounded-lg px-3 py-2 text-xs text-foreground">
                  {c.text}
                </div>
              ))}
              {(slide.comments || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No comments on this slide</p>
              )}
            </div>
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                  placeholder="Leave a comment..."
                  className="flex-1 text-xs bg-secondary rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button onClick={addComment} disabled={!commentInput.trim()} className="text-xs text-primary font-medium disabled:opacity-40">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom chat */}
      <div className="border-t px-4 py-2.5 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChat()}
            placeholder="Ask Lantid to edit slides... e.g. 'rewrite bullets for a technical audience'"
            disabled={isGenerating}
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={handleChat}
            disabled={!chatInput.trim() || isGenerating}
            className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>
        {chatMessages.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto space-y-1.5">
            {chatMessages.slice(-4).map((msg, i) => (
              <div key={i} className={`text-xs px-2 py-1 rounded ${msg.role === "user" ? "text-muted-foreground" : "text-foreground bg-secondary/50"}`}>
                {msg.role === "user" ? `You: ${msg.content}` : msg.content.slice(0, 150) + (msg.content.length > 150 ? "..." : "")}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
