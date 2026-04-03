"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { BlockEditor } from "./BlockEditor";
import {
  BLOCK_META,
  defaultBlockData,
  type Block,
  type BlockType,
} from "@/lib/blocks";
import { savePageBlocks, publishPage } from "@/app/admin/pages/actions";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function PageBuilder({
  pageId,
  initialBlocks,
  initialStatus,
}: {
  pageId: string;
  initialBlocks: Block[];
  initialStatus: string;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [status, setStatus] = useState(initialStatus);
  const [activeId, setActiveId] = useState<string | null>(
    initialBlocks[0]?.id ?? null
  );
  const [pending, setPending] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function addBlock(type: BlockType) {
    const block = {
      id: uid(),
      type,
      data: defaultBlockData(type),
    } as Block;
    setBlocks((bs) => [...bs, block]);
    setActiveId(block.id);
  }

  function removeBlock(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function updateBlock(id: string, data: Block["data"]) {
    setBlocks((bs) =>
      bs.map((b) => (b.id === id ? ({ ...b, data } as Block) : b))
    );
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlocks((bs) => {
      const from = bs.findIndex((b) => b.id === active.id);
      const to = bs.findIndex((b) => b.id === over.id);
      return arrayMove(bs, from, to);
    });
  }

  async function save() {
    setPending(true);
    setError(null);
    try {
      await savePageBlocks(pageId, JSON.stringify(blocks));
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function togglePublish() {
    setPending(true);
    setError(null);
    try {
      const next = status !== "published";
      await publishPage(pageId, next);
      setStatus(next ? "published" : "draft");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPending(false);
    }
  }

  const active = blocks.find((b) => b.id === activeId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 sticky top-0 bg-[var(--color-night)]/95 backdrop-blur py-3 z-10 border-b border-[var(--color-veil)]/40">
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={togglePublish} disabled={pending}>
            {status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <span
            className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${
              status === "published"
                ? "text-[var(--color-gold)] border-[var(--color-gold)]/40"
                : "text-[var(--color-mist)] border-[var(--color-veil)]"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="text-xs text-[var(--color-mist)]">
          {error ? (
            <span className="text-red-300">{error}</span>
          ) : savedAt ? (
            `Saved at ${savedAt}`
          ) : (
            "Unsaved changes save when you click Save"
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-mist)] mb-2">
              Blocks
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-1">
                  {blocks.map((b) => (
                    <SortableItem
                      key={b.id}
                      id={b.id}
                      active={activeId === b.id}
                      onClick={() => setActiveId(b.id)}
                      onRemove={() => removeBlock(b.id)}
                      label={BLOCK_META[b.type].label}
                      icon={BLOCK_META[b.type].icon}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            {blocks.length === 0 && (
              <p className="text-xs text-[var(--color-mist)]">
                No blocks yet. Add one below.
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-mist)] mb-2">
              Add block
            </p>
            <div className="grid grid-cols-2 gap-1">
              {(Object.keys(BLOCK_META) as BlockType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => addBlock(t)}
                  className="text-left px-2 py-1.5 rounded text-xs text-[var(--color-pearl)] hover:bg-[var(--color-night-3)]"
                  title={BLOCK_META[t].description}
                >
                  <span className="text-[var(--color-gold)] mr-1">
                    {BLOCK_META[t].icon}
                  </span>
                  {BLOCK_META[t].label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="rounded border border-[var(--color-veil)] bg-[var(--color-night-2)]/40 p-6 min-h-[400px]">
          {active ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-veil)]/40 pb-3">
                <h3 className="font-serif text-lg text-[var(--color-pearl)]">
                  {BLOCK_META[active.type].label}
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-mist)]">
                  {active.type}
                </span>
              </div>
              <BlockEditor
                block={active}
                onChange={(data) => updateBlock(active.id, data)}
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--color-mist)]">
              Select a block on the left to edit, or add one to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableItem({
  id,
  active,
  onClick,
  onRemove,
  label,
  icon,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  onRemove: () => void;
  label: string;
  icon: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
        active
          ? "bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/40"
          : "border border-transparent hover:bg-[var(--color-night-3)]"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[var(--color-mist)] hover:text-[var(--color-pearl)]"
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>
      <button
        onClick={onClick}
        className="flex-1 text-left text-[var(--color-pearl)]"
      >
        <span className="text-[var(--color-gold)] mr-1">{icon}</span>
        {label}
      </button>
      <button
        onClick={onRemove}
        className="text-red-300 hover:text-red-200 px-1"
        aria-label="Remove block"
      >
        ×
      </button>
    </li>
  );
}
