import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, Plus, X } from "lucide-react";
import bg from "@/assets/autumn-bg-v2.jpg";
import edgeLeft from "@/assets/autumn-edge-left.png";
import edgeRight from "@/assets/autumn-edge-right.png";
import sheet from "@/assets/autumn-emojis.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Autumn To Do list" },
      { name: "description", content: "En mysig höst-todo med veckodagar, emojis och anteckningar." },
      { property: "og:title", content: "Autumn To Do list" },
      { property: "og:description", content: "En mysig höst-todo med veckodagar, emojis och anteckningar." },
    ],
  }),
  component: Index,
});

type Todo = { id: string; text: string; emoji: number | null; done: boolean };
type Note = { id: string; title: string; body: string };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const YEAR = 2026;
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const uid = () => Math.random().toString(36).slice(2, 10);

function Emoji({ i, size = 32 }: { i: number; size?: number }) {
  return (
    <span
      className="emoji-sprite inline-block shrink-0 rounded"
      style={{ width: size, height: size, backgroundImage: `url(${sheet.url})`, backgroundPosition: `${(i % 5) * 25}% ${Math.floor(i / 5) * (100 / 6)}%` }}
    />
  );
}

function usePersisted<T>(name: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(name);
    if (raw) setV(JSON.parse(raw));
    setReady(true);
  }, [name]);
  useEffect(() => { if (ready) localStorage.setItem(name, JSON.stringify(v)); }, [name, v, ready]);
  return [v, setV] as const;
}

function mondayOf(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}

function Menu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button aria-label="Fler val" onClick={() => setOpen(!open)} className="p-1 text-panel-foreground"><MoreVertical size={18} /></button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg bg-background text-sm text-foreground shadow-soft">
          <button className="block w-full px-3 py-2 text-left hover:bg-panel-muted/40" onClick={() => { setOpen(false); onEdit(); }}>Redigera</button>
          <button className="block w-full px-3 py-2 text-left text-destructive hover:bg-panel-muted/40" onClick={() => { setOpen(false); onDelete(); }}>Ta bort</button>
        </div>
      )}
    </div>
  );
}

function Index() {
  const [month, setMonth] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [todos, setTodos] = usePersisted<Record<string, Todo[]>>("autumn-todos", {});
  const [notes, setNotes] = usePersisted<Note[]>("autumn-notes", []);
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState<number | null>(28);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const openNoteObj = notes.find((n) => n.id === openNote);

  const chooseMonth = (m: number) => {
    setMonth(m);
    setPickerOpen(false);
    const today = new Date();
    const first = today.getFullYear() === YEAR && today.getMonth() === m ? today : new Date(YEAR, m, 1);
    setWeekStart(mondayOf(first));
    setSelected(first);
  };

  const week = useMemo(() => DAYS.map((_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }), [weekStart]);
  const shiftWeek = (n: number) => {
    const w = new Date(weekStart); w.setDate(w.getDate() + 7 * n);
    setWeekStart(w); setSelected(w); setMonth(w.getMonth() === new Date(w.getTime() + 6 * 864e5).getMonth() ? w.getMonth() : new Date(w.getTime() + 6 * 864e5).getMonth());
  };

  const dayKey = key(selected);
  const list = todos[dayKey] ?? [];
  const updateList = (fn: (l: Todo[]) => Todo[]) => setTodos({ ...todos, [dayKey]: fn(list) });

  const addTodo = () => {
    if (!text.trim()) return;
    updateList((l) => [...l, { id: uid(), text: text.trim(), emoji, done: false }]);
    setText("");
  };
  const addNote = () => {
    if (!noteText.trim()) return;
    const n: Note = { id: uid(), title: noteText.trim(), body: "" };
    setNotes([...notes, n]);
    setNoteText("");
    setOpenNote(n.id);
    setDraftTitle(n.title);
    setDraftBody("");
  };

  const monthButton = (
    <div className="relative">
      <button onClick={() => setPickerOpen(!pickerOpen)} className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold text-primary-foreground shadow-soft ${month === null ? "bg-primary" : "bg-accent"}`}>
        {month === null ? "October" : MONTHS[month]} <CalendarDays size={18} />
      </button>
      {pickerOpen && (
        <div className="absolute left-1/2 top-12 z-30 grid w-72 -translate-x-1/2 grid-cols-3 gap-1 rounded-xl bg-panel p-2 shadow-soft">
          {MONTHS.map((m, i) => (
            <button key={m} onClick={() => chooseMonth(i)} className={`rounded-lg px-2 py-2 text-sm text-panel-foreground hover:bg-panel-item ${month === i ? "bg-accent" : ""}`}>{m.slice(0, 3)}</button>
          ))}
        </div>
      )}
    </div>
  );

  const title = (
    <h1 className="flex items-center gap-6 text-4xl font-semibold text-foreground">Autumn To Do list <Emoji i={9} size={64} /></h1>
  );

  return (
    <main className="relative min-h-screen bg-cover bg-center bg-fixed px-4 py-12" style={{ backgroundImage: `url(${bg})` }}>
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 z-0 w-[13vw] min-w-[80px] bg-left" style={{ backgroundImage: `url(${edgeLeft})`, backgroundSize: "100% 100%" }} />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-0 w-[13vw] min-w-[80px] bg-right" style={{ backgroundImage: `url(${edgeRight})`, backgroundSize: "100% 100%" }} />
      {month === null ? (
        <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
          {title}
          <p className="mt-4 text-xl font-semibold">Choose a month to open your week</p>
          {monthButton}
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8">
          {title}
          {monthButton}
          <div className="flex items-center gap-3">
            <button aria-label="Föregående vecka" onClick={() => shiftWeek(-1)} className="text-primary"><ChevronLeft /></button>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-7">
              {week.map((d, i) => {
                const active = key(d) === dayKey;
                const count = (todos[key(d)] ?? []).filter((t) => !t.done).length;
                return (
                  <button key={i} onClick={() => setSelected(d)} className={`relative flex h-[76px] w-20 flex-col items-center justify-center gap-2 rounded-2xl text-sm text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 ${active ? "bg-accent" : "bg-primary"}`}>
                    <span>{DAYS[i]}</span><span>{d.getDate()}</span>
                    {count > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-panel-muted" />}
                  </button>
                );
              })}
            </div>
            <button aria-label="Nästa vecka" onClick={() => shiftWeek(1)} className="text-primary"><ChevronRight /></button>
          </div>

          <div className="grid w-full gap-10 md:grid-cols-[1.6fr_1fr]">
            <section>
              <h2 className="mb-5 text-center text-2xl font-semibold">{DAY_NAMES[(selected.getDay() + 6) % 7]} - To Do</h2>
              <div className="min-h-[440px] rounded-3xl bg-panel p-5 shadow-soft">
                <form onSubmit={(e) => { e.preventDefault(); addTodo(); }} className="relative flex items-center gap-2 rounded bg-panel-item px-4 py-2">
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add Todo" className="min-w-0 flex-1 bg-transparent py-2 text-panel-foreground placeholder:text-panel-muted outline-none" />
                  <button type="button" aria-label="Välj emoji" onClick={() => setEmojiOpen(!emojiOpen)} className="flex items-center gap-1 rounded bg-panel/40 px-1 py-1 text-panel-foreground">
                    {emoji !== null ? <Emoji i={emoji} size={28} /> : <span className="w-7 text-xs">—</span>}<ChevronDown size={16} />
                  </button>
                  <button type="submit" aria-label="Lägg till" className="p-1 text-panel-foreground"><Plus /></button>
                  {emojiOpen && (
                    <div className="absolute right-0 top-14 z-20 grid grid-cols-5 gap-1 rounded-xl bg-background p-2 shadow-soft">
                      <button type="button" onClick={() => { setEmoji(null); setEmojiOpen(false); }} className="h-10 w-10 rounded text-xs hover:bg-panel-muted/40">Ingen</button>
                      {Array.from({ length: 35 }, (_, i) => (
                        <button type="button" key={i} onClick={() => { setEmoji(i); setEmojiOpen(false); }} className="flex h-10 w-10 items-center justify-center rounded hover:bg-panel-muted/40"><Emoji i={i} /></button>
                      ))}
                    </div>
                  )}
                </form>
                <ul className="mt-6 space-y-6">
                  {list.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded bg-panel-item px-4 py-3 text-panel-foreground">
                      <button aria-label="Markera klar" onClick={() => updateList((l) => l.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-panel-foreground">
                        {t.done && <Check size={14} strokeWidth={3} />}
                      </button>
                      <span className={`text-lg ${t.done ? "line-through opacity-70" : ""}`}>{t.text}</span>
                      {t.emoji !== null && <Emoji i={t.emoji} size={34} />}
                      <span className="flex-1" />
                      <Menu
                        onEdit={() => { const v = prompt("Redigera", t.text); if (v?.trim()) updateList((l) => l.map((x) => x.id === t.id ? { ...x, text: v.trim() } : x)); }}
                        onDelete={() => updateList((l) => l.filter((x) => x.id !== t.id))}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-center text-2xl font-semibold">Notes</h2>
              <div className="min-h-[440px] rounded-3xl bg-panel p-5 shadow-soft">
                <form onSubmit={(e) => { e.preventDefault(); addNote(); }} className="flex items-center gap-2 rounded bg-panel-item px-4 py-2">
                  <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add Note" className="min-w-0 flex-1 bg-transparent py-2 text-panel-foreground placeholder:text-panel-muted outline-none" />
                  <button type="submit" aria-label="Lägg till anteckning" className="p-1 text-panel-foreground"><Plus /></button>
                </form>
                <ul className="mt-6 space-y-6">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded bg-panel-item text-panel-foreground">
                      <div className="flex items-center px-4 py-3">
                        <button onClick={() => { setOpenNote(n.id); setDraftTitle(n.title); setDraftBody(n.body); }} className="flex-1 text-left text-lg font-semibold">{n.title}</button>
                        <Menu
                          onEdit={() => { const v = prompt("Byt namn", n.title); if (v?.trim()) setNotes(notes.map((x) => x.id === n.id ? { ...x, title: v.trim() } : x)); }}
                          onDelete={() => setNotes(notes.filter((x) => x.id !== n.id))}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}

      {openNoteObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setOpenNote(null)}>
          <div className="w-full max-w-xl rounded-2xl bg-panel p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} aria-label="Anteckningens rubrik" className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-panel-foreground outline-none" />
              <button aria-label="Stäng" onClick={() => setOpenNote(null)} className="p-1 text-panel-foreground"><X size={22} /></button>
            </div>
            <textarea autoFocus value={draftBody} onChange={(e) => setDraftBody(e.target.value)} placeholder="Skriv din anteckning..." className="h-80 w-full resize-none rounded-xl bg-panel-item p-4 text-lg text-panel-foreground placeholder:text-panel-muted outline-none" />
            <div className="mt-4 flex justify-end">
              <button onClick={() => { setNotes(notes.map((x) => x.id === openNoteObj.id ? { ...x, title: draftTitle.trim() || x.title, body: draftBody } : x)); setOpenNote(null); }} className="rounded-full bg-accent px-7 py-2.5 text-lg font-semibold text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5">Spara</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
