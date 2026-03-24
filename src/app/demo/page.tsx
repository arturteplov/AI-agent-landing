"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const DEMO_KEY = "cluska8demo";
const API = "/backend/api";

const SCENARIOS = [
  { label: "I was charged twice", message: "I was charged twice this month. I see two charges of $49 on my card." },
  { label: "Wrong plan showing", message: "My account shows the wrong plan — I'm paying for Pro but it says Starter." },
  { label: "Cancel + refund", message: "I want to cancel my subscription and get a refund for this month." },
  { label: "Trial still charging", message: "My trial expired but I'm still being charged the full price." },
];

const CUSTOMER = {
  email: "jane@acmecustomer.com",
  name: "Jane Acme",
  company_id: "acme-uuid",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMsg {
  role: "customer" | "ai" | "system";
  text: string;
}

interface TraceStep {
  id: string;
  step_number: number;
  step_type: string;
  content: Record<string, unknown>;
  created_at: string;
}

interface SimulateResp {
  status: string;
  response_text?: string;
  confidence?: number;
  action_taken?: Record<string, unknown> | null;
  action_proposed?: Record<string, unknown> | null;
  needs_approval?: boolean;
  should_escalate?: boolean;
  tools_used?: string[];
  reasoning_trace_ids?: string[];
  ticket_status?: string;
  approval_request_id?: string;
  ticket_id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function traceToLine(t: TraceStep): { icon: string; text: string } {
  const c = t.content;
  switch (t.step_type) {
    case "tool_called": {
      const name = (c.tool_name as string) || "tool";
      const params = c.parameters as Record<string, unknown> | undefined;
      if (name === "get_recent_charges")
        return { icon: "🔍", text: `Looking up charges for ${params?.customer_email || "customer"}` };
      if (name === "get_customer_subscription")
        return { icon: "🔍", text: `Looking up subscription details for ${params?.customer_email || "customer"}` };
      if (name === "get_account_status")
        return { icon: "🔍", text: `Checking account status for ${params?.customer_email || "customer"}` };
      if (name === "create_refund")
        return { icon: "⚡", text: `Requesting refund: $${((params?.amount_cents as number) || 0) / 100} → ${params?.charge_id || "charge"}` };
      if (name === "apply_credit")
        return { icon: "⚡", text: `Applying credit: $${((params?.amount_cents as number) || 0) / 100}` };
      if (name === "extend_trial")
        return { icon: "⚡", text: `Extending trial by ${params?.days || "?"} days` };
      return { icon: "🔧", text: `Calling ${name}` };
    }
    case "tool_result": {
      const name = (c.tool_name as string) || "";
      const data = c.data as Record<string, unknown> | undefined;
      if (name === "get_recent_charges") {
        const count = (data?.total_count as number) || (data?.charges as unknown[])?.length || 0;
        return { icon: "✓", text: `Found ${count} charges in recent history` };
      }
      if (name === "get_customer_subscription") {
        const plan = (data?.plan as string) || "?";
        const amt = (data?.amount_cents as number) || 0;
        const bd = (data?.billing_date as number) || "?";
        return { icon: "✓", text: `Found: ${plan} plan, $${amt / 100}/mo, billing date: ${bd}${typeof bd === "number" ? _ordinal(bd) : ""}` };
      }
      if (name === "get_account_status")
        return { icon: "✓", text: `Account status retrieved` };
      if (c.success === false)
        return { icon: "✗", text: `Tool failed: ${c.error || "unknown error"}` };
      return { icon: "✓", text: `${name || "Tool"} result received` };
    }
    case "approval_requested": {
      const ch = (c.approval_channel as string) || "#support-approvals";
      return { icon: "→", text: `Approval required — sent to ${ch}` };
    }
    case "approval_received":
      return { icon: "✅", text: `Approved by @${(c.responded_by as string) || "team"}` };
    case "action_executed": {
      const name = (c.tool_name as string) || "action";
      const data = c.data as Record<string, unknown> | undefined;
      if (name === "create_refund")
        return { icon: "✓", text: `Refund processed: $${((data?.amount_cents as number) || 0) / 100} → ${data?.charge_id || "charge"}` };
      return { icon: "✓", text: `${name} executed successfully` };
    }
    case "response_sent":
      return { icon: "✓", text: "Response sent to customer" };
    case "reasoning":
      return { icon: "💭", text: (c.decision as string) || "Reasoning step" };
    default:
      return { icon: "·", text: `${t.step_type}` };
  }
}

function _ordinal(n: number): string {
  if (n === 1 || n === 21 || n === 31) return "st";
  if (n === 2 || n === 22) return "nd";
  if (n === 3 || n === 23) return "rd";
  return "th";
}

// ─── Components ───────────────────────────────────────────────────────────────

function Gate({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  if (params.get("key") !== DEMO_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted)]">Not found.</p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-[var(--muted)]">Loading…</p></div>}>
      <Gate>
        <Demo />
      </Gate>
    </Suspense>
  );
}

function Demo() {
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [traces, setTraces] = useState<{ icon: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const chatEnd = useRef<HTMLDivElement>(null);
  const traceEnd = useRef<HTMLDivElement>(null);
  const tracesRef = useRef(traces);
  tracesRef.current = traces;

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);
  useEffect(() => { traceEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [traces]);

  const pushTrace = useCallback((icon: string, text: string) => {
    setTraces((prev) => [...prev, { icon, text }]);
  }, []);

  const runScenario = useCallback(async (message: string) => {
    if (running) return;
    setRunning(true);
    setChat([]);
    setTraces([]);
    setApprovalId(null);
    setTicketId(null);

    setChat([{ role: "customer", text: message }]);
    pushTrace("⏳", "Reading customer message…");

    await sleep(400);
    pushTrace("⏳", "Connecting to AI engine…");

    let resp: SimulateResp;
    try {
      const r = await fetch(`${API}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: CUSTOMER.company_id,
          customer_message: message,
          customer_email: CUSTOMER.email,
          customer_name: CUSTOMER.name,
        }),
      });
      resp = await r.json();
    } catch {
      pushTrace("✗", "API error — is the backend running on :8000?");
      setRunning(false);
      return;
    }

    if (resp.status !== "processed") {
      pushTrace("✗", `API returned: ${resp.status}`);
      setRunning(false);
      return;
    }

    // Fetch reasoning traces and animate them
    if (resp.ticket_id) {
      setTicketId(resp.ticket_id);
      try {
        const tr = await fetch(`${API}/traces/${resp.ticket_id}`);
        const steps: TraceStep[] = await tr.json();
        // Replace the placeholder traces with real ones
        setTraces([]);
        for (const step of steps) {
          const line = traceToLine(step);
          await sleep(250 + Math.random() * 200);
          setTraces((prev) => [...prev, line]);
        }
      } catch {
        pushTrace("⚠", "Could not load reasoning traces");
      }
    }

    // Approval state
    if (resp.needs_approval && resp.approval_request_id) {
      setApprovalId(resp.approval_request_id);
      await sleep(300);
      pushTrace("⏳", "Waiting for approval…");
    }

    // AI response
    if (resp.response_text) {
      await sleep(400);
      setChat((prev) => [...prev, { role: "ai", text: resp.response_text! }]);
    }

    // Status
    if (resp.ticket_status) {
      await sleep(200);
      pushTrace("📋", `Ticket status: ${resp.ticket_status}`);
    }

    setRunning(false);
  }, [running, pushTrace]);

  const handleApprove = useCallback(async () => {
    if (!approvalId || !ticketId || approving) return;
    setApproving(true);
    pushTrace("👆", "Human tapped Approve in Slack…");

    try {
      const payload = {
        actions: [{ action_id: "approve_action", value: JSON.stringify({ approval_request_id: approvalId, ticket_id: ticketId }) }],
        user: { username: "john", name: "John" },
        channel: { id: "C_DEMO" },
        message: { ts: "1234567890.000001" },
      };
      await fetch(`${API}/slack/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `payload=${encodeURIComponent(JSON.stringify(payload))}`,
      });

      await sleep(500);
      pushTrace("✅", "Approved by @john");

      // Re-fetch traces for the post-approval steps
      if (ticketId) {
        await sleep(1500);
        try {
          const tr = await fetch(`${API}/traces/${ticketId}`);
          const steps: TraceStep[] = await tr.json();
          const approvalSteps = steps.filter(
            (s) => s.step_type === "approval_received" || s.step_type === "action_executed" || (s.step_type === "response_sent" && s.step_number >= 0),
          );
          const existingTexts = new Set(tracesRef.current.map((t) => t.text));
          for (const step of approvalSteps) {
            const line = traceToLine(step);
            if (!existingTexts.has(line.text)) {
              await sleep(300);
              setTraces((prev) => [...prev, line]);
            }
          }
        } catch { /* ignore */ }
      }

      setApprovalId(null);
      setChat((prev) => [
        ...prev,
        { role: "system", text: "Refund approved and processed. The customer has been notified." },
      ]);
    } catch {
      pushTrace("✗", "Approve call failed");
    }
    setApproving(false);
  }, [approvalId, ticketId, approving, pushTrace]);

  const handleSend = () => {
    if (!input.trim() || running) return;
    runScenario(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--background)]">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight">cluska8</span>
          <span className="text-xs text-[var(--muted)]">live demo</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.label}
              disabled={running}
              onClick={() => { setInput(""); runScenario(s.message); }}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-hover)] disabled:opacity-40"
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main area */}
      <div className="flex min-h-0 flex-1">
        {/* Chat panel (left) */}
        <div className="flex w-[60%] flex-col border-r border-[var(--border)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chat.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[var(--muted)]">
                  Pick a scenario above or type a message below.
                </p>
              </div>
            )}
            {chat.map((m, i) => (
              <ChatBubble key={i} msg={m} />
            ))}
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border)] p-4">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a customer message…"
                disabled={running}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={running || !input.trim()}
                className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Reasoning panel (right) */}
        <div className="flex w-[40%] flex-col">
          <div className="border-b border-[var(--border)] px-5 py-3">
            <h2 className="text-sm font-semibold text-[var(--muted)]">
              AI Reasoning Trace
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {traces.length === 0 && (
              <p className="text-xs text-[var(--muted)]/50">
                Trace steps will appear here as the AI works…
              </p>
            )}
            <div className="space-y-2.5">
              {traces.map((t, i) => (
                <TraceLine key={i} icon={t.icon} text={t.text} isNew={i === traces.length - 1} />
              ))}
              <div ref={traceEnd} />
            </div>

            {approvalId && !approving && (
              <div className="mt-6">
                <button
                  onClick={handleApprove}
                  className="w-full rounded-lg bg-[var(--success)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  ✅ Approve Refund
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isCustomer = msg.role === "customer";
  const isSystem = msg.role === "system";
  return (
    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isCustomer
            ? "bg-[var(--accent)] text-white"
            : isSystem
              ? "bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)]"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
      </div>
    </div>
  );
}

function TraceLine({ icon, text, isNew }: { icon: string; text: string; isNew: boolean }) {
  return (
    <div className={`flex items-start gap-2.5 text-sm font-mono transition-opacity duration-500 ${isNew ? "animate-fade-in" : ""}`}>
      <span className="shrink-0 w-5 text-center">{icon}</span>
      <span className="text-[var(--muted)]">{text}</span>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
