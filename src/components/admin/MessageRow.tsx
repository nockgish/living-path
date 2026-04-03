"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleRead, deleteMessage } from "@/app/admin/messages/actions";

export function MessageRow({
  id,
  name,
  email,
  message,
  read,
  createdAt,
}: {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function mark(next: boolean) {
    startTransition(async () => {
      await toggleRead(id, next);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Delete this message?")) return;
    startTransition(async () => {
      await deleteMessage(id);
      router.refresh();
    });
  }

  return (
    <li
      className={`rounded border p-4 ${
        read
          ? "border-[var(--color-veil)]/40 bg-transparent"
          : "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          className="text-left flex-1"
          onClick={() => {
            setOpen(!open);
            if (!read) mark(true);
          }}
        >
          <p className="text-sm text-[var(--color-pearl)]">
            {name}{" "}
            <span className="text-xs text-[var(--color-mist)]">· {email}</span>
          </p>
          <p className="text-xs text-[var(--color-moon)] mt-1">{createdAt}</p>
          {!open && (
            <p className="text-sm text-[var(--color-mist)] mt-2 line-clamp-1">
              {message}
            </p>
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => mark(!read)}
            disabled={pending}
            className="text-[10px] uppercase tracking-widest text-[var(--color-mist)] hover:text-[var(--color-gold-soft)]"
          >
            {read ? "Mark unread" : "Mark read"}
          </button>
          <button
            onClick={remove}
            disabled={pending}
            className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-200"
          >
            Delete
          </button>
        </div>
      </div>
      {open && (
        <p className="text-sm text-[var(--color-pearl)] mt-3 whitespace-pre-wrap border-t border-[var(--color-veil)]/40 pt-3">
          {message}
        </p>
      )}
    </li>
  );
}
