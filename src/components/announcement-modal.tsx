"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Megaphone } from "lucide-react";
import { Modal } from "./ui/modal";
import { FormError } from "./ui/field";

export function AnnouncementModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function send() {
    if (!body.trim()) {
      setError("Write something to announce.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not post the announcement.");
        setSaving(false);
        return;
      }
      setBody("");
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Team announcement"
      description="Goes to every athlete on the team."
      size="md"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-gold" onClick={send} disabled={saving}>
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Megaphone size={16} />
            )}
            Post announcement
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {error && <FormError message={error} />}
        <textarea
          autoFocus
          className="input min-h-[140px] resize-y"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. Saturday's time trial moves to 7:00 AM. Bring spikes and arrive 30 min early to warm up."
        />
      </div>
    </Modal>
  );
}
