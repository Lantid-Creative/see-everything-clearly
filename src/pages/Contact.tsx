import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulated submission — wire to backend later.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSent(true);
    toast({
      title: "Message sent",
      description: "We'll get back to you within one business day.",
    });
  };

  return (
    <>
      <section className="bg-sidebar text-sidebar-primary py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border text-xs font-medium mb-6">
            Contact
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tight leading-[1.05]">
            Let's build something{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              remarkable
            </span>
          </h1>
          <p className="mt-6 text-sidebar-foreground max-w-xl mx-auto leading-relaxed">
            Tell us about your project. A principal engineer responds within one business day —
            not a sales template.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 lg:p-10">
            {sent ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mt-6 font-serif text-3xl text-foreground">Thank you</h2>
                <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                  Your message is in. Expect a personal reply within one business day.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm font-semibold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-serif text-2xl text-foreground">Tell us about your project</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full name" name="name" type="text" required placeholder="Jane Doe" />
                  <Field label="Work email" name="email" type="email" required placeholder="jane@company.com" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Company" name="company" type="text" placeholder="Acme Corp" />
                  <Field label="Phone" name="phone" type="tel" placeholder="+1 555 000 0000" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">
                    Service of interest
                  </label>
                  <select
                    name="service"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option>Software Development</option>
                    <option>Mobile App Development</option>
                    <option>AI & Machine Learning</option>
                    <option>Cybersecurity</option>
                    <option>Blockchain Solutions</option>
                    <option>Cloud & DevOps</option>
                    <option>Not sure yet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">
                    Project details
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    placeholder="Goals, timeline, budget range — whatever you can share."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3.5 text-sm hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send message
                      <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <InfoCard
              Icon={Phone}
              title="Call us"
              value="+971 4 439 7212"
              sub="Mon–Fri, 9am–6pm GST"
              href="tel:+97144397212"
            />
            <InfoCard
              Icon={Mail}
              title="Email us"
              value="hello@lantid.com"
              sub="Response within 1 business day"
              href="mailto:hello@lantid.com"
            />
            <InfoCard
              Icon={MapPin}
              title="Visit us"
              value="Dubai, United Arab Emirates"
              sub="DIFC, Gate Avenue Level 3"
            />

            <div className="rounded-2xl border border-border bg-sidebar text-sidebar-primary p-6">
              <h3 className="font-semibold">Prefer to skip the form?</h3>
              <p className="mt-2 text-sm text-sidebar-foreground">
                Book a 30-minute discovery call directly with one of our principals.
              </p>
              <a
                href="mailto:hello@lantid.com?subject=Discovery%20Call"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
              >
                Book a call →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function InfoCard({
  Icon,
  title,
  value,
  sub,
  href,
}: {
  Icon: typeof Phone;
  title: string;
  value: string;
  sub: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
        <div className="mt-1 font-semibold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </>
  );
  const className =
    "flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors";
  return href ? (
    <a href={href} className={className}>
      {inner}
    </a>
  ) : (
    <div className={className}>{inner}</div>
  );
}
