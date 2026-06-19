"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Megaphone, ChevronLeft, Loader2 } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { fmtRelative, fmtTime, format, isToday } from "@/lib/date";
import type { MessageDTO } from "@/lib/dto";

type Ann = { id: string; body: string; createdISO: string };

const ANN = "__ANNOUNCEMENTS__";

function stamp(iso: string) {
  return isToday(iso) ? fmtTime(iso) : format(iso, "MMM d · h:mm a");
}

export function MessagesView({
  meId,
  isCoach,
  coachName,
  athletes,
  initialDms,
  initialAnns,
}: {
  meId: string;
  isCoach: boolean;
  coachName: string;
  athletes: { id: string; name: string }[];
  initialDms: MessageDTO[];
  initialAnns: Ann[];
}) {
  const router = useRouter();
  const [dms, setDms] = useState<MessageDTO[]>(initialDms);
  const [anns, setAnns] = useState<Ann[]>(initialAnns);
  const [selected, setSelected] = useState<string>(ANN);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const other = (m: MessageDTO) => (m.senderId === meId ? m.recipientId : m.senderId);

  // Build thread list
  const threads = useMemo(() => {
    const partners = isCoach
      ? athletes.map((a) => ({ id: a.id, name: a.name }))
      : [{ id: athletes[0]?.id ?? "coach", name: coachName }];
    return partners
      .map((p) => {
        const msgs = dms.filter((m) => other(m) === p.id);
        const last = msgs[msgs.length - 1];
        const unread = msgs.filter(
          (m) => m.recipientId === meId && !m.read
        ).length;
        return { ...p, last, unread };
      })
      .sort((a, b) => {
        if (!a.last && !b.last) return a.name.localeCompare(b.name);
        if (!a.last) return 1;
        if (!b.last) return -1;
        return b.last.createdISO.localeCompare(a.last.createdISO);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dms, athletes, isCoach, coachName, meId]);

  const selectedMessages = useMemo(() => {
    if (selected === ANN) return [];
    return dms
      .filter((m) => other(m) === selected)
      .sort((a, b) => a.createdISO.localeCompare(b.createdISO));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dms, selected, meId]);

  const selectedName =
    selected === ANN
      ? "Team Announcements"
      : threads.find((t) => t.id === selected)?.name ?? "";

  // Scroll to bottom on conversation change / new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [selected, dms, anns]);

  async function openConversation(key: string) {
    setSelected(key);
    setMobileView("thread");
    if (key === ANN) {
      if (!isCoach) {
        await fetch("/api/announcements/read", { method: "POST" }).catch(() => {});
        router.refresh();
      }
      return;
    }
    // mark DM thread read
    const hasUnread = dms.some(
      (m) => other(m) === key && m.recipientId === meId && !m.read
    );
    if (hasUnread) {
      setDms((prev) =>
        prev.map((m) =>
          other(m) === key && m.recipientId === meId ? { ...m, read: true } : m
        )
      );
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withUserId: key }),
      }).catch(() => {});
      router.refresh();
    }
  }

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      if (selected === ANN) {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        const data = await res.json();
        if (res.ok) {
          setAnns((prev) => [...prev, { id: data.id, body, createdISO: data.createdISO }]);
          setDraft("");
          router.refresh();
        }
      } else {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: selected, body }),
        });
        const data = await res.json();
        if (res.ok) {
          setDms((prev) => [
            ...prev,
            {
              id: data.id,
              type: "DIRECT",
              body,
              senderId: meId,
              recipientId: selected,
              createdISO: data.createdISO,
              read: true,
            },
          ]);
          setDraft("");
          router.refresh();
        }
      }
    } finally {
      setSending(false);
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const composerDisabled = selected === ANN && !isCoach;

  return (
    <div className="card flex h-[calc(100dvh-12rem)] min-h-[480px] overflow-hidden sm:h-[calc(100vh-9rem)]">
      {/* Conversation list */}
      <div
        className={cn(
          "w-full shrink-0 border-r border-slate-200 sm:w-72 sm:max-w-[40%]",
          mobileView === "thread" ? "hidden sm:block" : "block"
        )}
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Conversations</h2>
        </div>
        <div className="h-[calc(100%-49px)] overflow-y-auto scroll-thin">
          {/* Announcements channel */}
          <button
            onClick={() => openConversation(ANN)}
            className={cn(
              "flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition",
              selected === ANN ? "bg-brand-50" : "hover:bg-slate-50"
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
              <Megaphone size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">Team Announcements</div>
              <div className="truncate text-xs text-slate-500">
                {anns.length
                  ? anns[anns.length - 1].body
                  : "No announcements yet"}
              </div>
            </div>
          </button>

          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => openConversation(t.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition",
                selected === t.id ? "bg-brand-50" : "hover:bg-slate-50"
              )}
            >
              <Avatar name={t.name} seed={t.id} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-ink">
                    {t.name}
                  </span>
                  {t.last && (
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {fmtRelative(t.last.createdISO)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-slate-500">
                    {t.last
                      ? `${t.last.senderId === meId ? "You: " : ""}${t.last.body}`
                      : "Start a conversation"}
                  </span>
                  {t.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white">
                      {t.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          mobileView === "list" ? "hidden sm:flex" : "flex"
        )}
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <button
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 sm:hidden"
            onClick={() => setMobileView("list")}
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </button>
          {selected === ANN ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
              <Megaphone size={16} />
            </span>
          ) : (
            <Avatar name={selectedName} seed={selected} size={36} />
          )}
          <div>
            <div className="text-sm font-semibold text-ink">{selectedName}</div>
            <div className="text-xs text-slate-400">
              {selected === ANN
                ? isCoach
                  ? "Visible to all athletes"
                  : `From ${coachName}`
                : isCoach
                  ? "Private message"
                  : "Your coach"}
            </div>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scroll-thin bg-slate-50/60 p-4">
          {selected === ANN ? (
            anns.length === 0 ? (
              <EmptyHint text="No announcements yet." />
            ) : (
              anns.map((a) => (
                <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                      <Megaphone size={12} />
                    </span>
                    <span className="text-xs font-semibold text-ink">{coachName}</span>
                    <span className="text-xs text-slate-400">· {stamp(a.createdISO)}</span>
                  </div>
                  <p className="whitespace-pre-line text-sm text-slate-700">{a.body}</p>
                </div>
              ))
            )
          ) : selectedMessages.length === 0 ? (
            <EmptyHint text="No messages yet. Send the first one below." />
          ) : (
            selectedMessages.map((m) => {
              const mine = m.senderId === meId;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-card",
                      mine
                        ? "rounded-br-sm bg-ink text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                    )}
                  >
                    <p className="whitespace-pre-line">{m.body}</p>
                    <div
                      className={cn(
                        "mt-1 text-[10px]",
                        mine ? "text-slate-300" : "text-slate-400"
                      )}
                    >
                      {stamp(m.createdISO)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* composer */}
        {composerDisabled ? (
          <div className="border-t border-slate-100 bg-white px-4 py-3 text-center text-xs text-slate-400">
            Only your coach can post announcements.
          </div>
        ) : (
          <div className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder={
                  selected === ANN
                    ? "Write an announcement to the whole team..."
                    : "Type a message..."
                }
                className="input max-h-32 min-h-[42px] flex-1 resize-none py-2.5"
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className={cn(
                  "btn shrink-0",
                  selected === ANN ? "btn-gold" : "btn-primary"
                )}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
