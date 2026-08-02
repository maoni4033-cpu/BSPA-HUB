import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import {
  Megaphone, Users, CalendarDays, BookOpen, ShieldCheck, Pin,
  Plus, Trash2, MapPin, Clock, Link as LinkIcon, X, ChevronRight,
  UserCircle2, Mountain, MessageCircle, Sparkles, Send
} from "lucide-react";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');";

const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);

const OFFICER_TERM = "AY 2026–2027";
const ADMIN_NAME = "Maria Fatima Bien";
const AI_ASSISTANT_ENABLED = false;

const seedMembers = [
  { id: uid(), name: "Grazielle T. Amador", position: "President", course: "", email: "", bio: "" },
  { id: uid(), name: "Mark Lester O. Mission", position: "Vice President", course: "", email: "", bio: "" },
  { id: uid(), name: "Jennierose Boral", position: "Secretary", course: "", email: "", bio: "" },
  { id: uid(), name: "Alexa Mae N. Par", position: "Treasurer", course: "", email: "", bio: "" },
  { id: uid(), name: "Gwyneth Mae Nueva", position: "Auditor", course: "", email: "", bio: "" },
  { id: uid(), name: "Cristine Joy Bania", position: "Public Relations Officer", course: "", email: "", bio: "" },
  { id: uid(), name: "Ma. Aurelia Manabat", position: "Business Manager", course: "", email: "", bio: "" },
  { id: uid(), name: "Geraldine Sanchez", position: "Business Manager", course: "", email: "", bio: "" },
  { id: uid(), name: "Maria Fatima Bien", position: "4th Year Representative", course: "4th Year", email: "", bio: "" },
  { id: uid(), name: "Irich Anne Jocson", position: "3rd Year Representative", course: "3rd Year", email: "", bio: "" },
  { id: uid(), name: "Angel Mae Alperez", position: "2nd Year Representative", course: "2nd Year", email: "", bio: "" },
];

const EVENT_CATEGORIES = ["Major Activities", "Minor Activities", "Social Responsibility"];

const seedAnnouncements = [
  { id: uid(), title: "Leadership Training for Officers — August 8", body: "All officers are required to attend the Leadership Training on August 8, 2026, 1:00 PM, at Naga College Foundation, Inc.", date: todayISO(), author: "BSPA-NCF Officers", pinned: true },
  { id: uid(), title: "General Assembly — August 15", body: "The chapter General Assembly will be held on August 15, 2026, 1:00 PM, at Naga College Foundation, Inc. All members are expected to attend.", date: todayISO(), author: "BSPA-NCF Officers", pinned: true },
];

const seedEvents = [
  { id: uid(), title: "Leadership Training for Officers", date: "2026-08-08", time: "13:00", location: "Naga College Foundation, Inc.", description: "", category: "", attendees: [] },
  { id: uid(), title: "General Assembly", date: "2026-08-15", time: "13:00", location: "Naga College Foundation, Inc.", description: "", category: "", attendees: [] },
];

const seedResources = [
  { id: uid(), title: "The Local Government Code of the Philippines (RA 7160)", description: "Complete text of the Local Government Code of 1991, via the Official Gazette.", url: "https://www.officialgazette.gov.ph/1991/10/10/republic-act-no-7160/", category: "Laws & Issuances" },
  { id: uid(), title: "The 1987 Constitution of the Republic of the Philippines", description: "Complete text of the Philippine Constitution, via the Official Gazette.", url: "https://www.officialgazette.gov.ph/constitutions/1987-constitution/", category: "Laws & Issuances" },
  { id: uid(), title: "Civil Service Commission of the Philippines", description: "Official CSC website — laws, memorandum circulars, examinations, and services.", url: "https://csc.gov.ph/", category: "Laws & Issuances" },
];

async function loadShared(key, fallback) {
  try {
    const { data, error } = await supabase
      .from("org_store")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return fallback;
    return data.value;
  } catch {
    return fallback;
  }
}
async function saveShared(key, value) {
  try {
    await supabase
      .from("org_store")
      .upsert({ key, value, updated_at: new Date().toISOString() });
  } catch {}
}

function Seal({ size = 96 }) {
  return (
    <img
      src="/logo.png"
      alt="BSPA-NCF Chapter seal"
      width={size}
      height={size}
      className="shrink-0 rounded-full object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function Section({ icon: Icon, title, eyebrow, children, action }) {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-4 border-b border-[#E3DCC9] pb-3">
        <div>
          <div className="text-[11px] tracking-[0.18em] text-[#7A2E3A] font-semibold uppercase" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
            {eyebrow}
          </div>
          <h2 className="text-2xl md:text-3xl text-[#1B4332] flex items-center gap-2" style={{ fontFamily: "Fraunces, serif", fontWeight: 700 }}>
            <Icon size={22} className="text-[#D9A441]" /> {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState("member");
  const [userName, setUserName] = useState("");
  const [tab, setTab] = useState("home");
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);

  const [nameDraft, setNameDraft] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, a, e, r] = await Promise.all([
        loadShared("members", seedMembers),
        loadShared("announcements", seedAnnouncements),
        loadShared("events", seedEvents),
        loadShared("resources", seedResources),
      ]);
      setMembers(m); setAnnouncements(a); setEvents(e); setResources(r);
      const loadedName = localStorage.getItem("bspa_username") || "";
      const loadedRole = localStorage.getItem("bspa_userrole") || "";
      if (loadedName) setUserName(loadedName);
      const valid = loadedRole === "officer" && loadedName.trim().toLowerCase() === ADMIN_NAME.toLowerCase();
      setRole(valid ? "officer" : "member");
      setLoading(false);
    })();
  }, []);

  const persist = useCallback((key, setter) => (updater) => {
    setter((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveShared(key, next);
      return next;
    });
  }, []);
  const setMembersP = persist("members", setMembers);
  const setAnnouncementsP = persist("announcements", setAnnouncements);
  const setEventsP = persist("events", setEvents);
  const setResourcesP = persist("resources", setResources);

  const isOfficer = role === "officer";

  const signIn = (name, asOfficer) => {
    const grantOfficer = asOfficer && name.trim().toLowerCase() === ADMIN_NAME.toLowerCase();
    setUserName(name);
    setRole(grantOfficer ? "officer" : "member");
    localStorage.setItem("bspa_username", name);
    localStorage.setItem("bspa_userrole", grantOfficer ? "officer" : "member");
    setShowSignIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E6]">
        <style>{FONT_IMPORT}</style>
        <div className="text-[#1B4332]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>loading chapter hub…</div>
      </div>
    );
  }

  const pinned = announcements.filter((a) => a.pinned);
  const unpinned = announcements.filter((a) => !a.pinned).sort((x, y) => (x.date < y.date ? 1 : -1));
  const upcoming = [...events].sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));

  const NAV = [
    { key: "home", label: "Home", icon: Megaphone },
    { key: "members", label: "Members", icon: Users },
    { key: "events", label: "Events", icon: CalendarDays },
    { key: "learning", label: "Learning Hub", icon: BookOpen },
    { key: "chat", label: "Chat", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#22201B]" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`${FONT_IMPORT}
        ::selection{background:#D9A441;color:#1B4332}
        .btn-primary{background:#1B4332;color:#F5F1E6}
        .btn-primary:hover{background:#123024}
        .btn-gold{background:#D9A441;color:#1B4332}
        .btn-gold:hover{background:#c8933a}
        .card{background:#FFFDF8;border:1px solid #E3DCC9}
      `}</style>

      <header className="border-b border-[#E3DCC9] bg-[#FFFDF8]">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-4">
          <Seal size={56} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#7A2E3A] font-semibold" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              Chapter Organization Hub
            </div>
            <h1 className="text-lg md:text-xl leading-tight text-[#1B4332] truncate" style={{ fontFamily: "Fraunces, serif", fontWeight: 700 }}>
              BSPA-NCF Chapter
            </h1>
          </div>
          <button
            onClick={() => setShowSignIn(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#1B4332]/20 hover:border-[#1B4332] transition-colors text-sm shrink-0"
          >
            <UserCircle2 size={18} className={isOfficer ? "text-[#7A2E3A]" : "text-[#1B4332]"} />
            <span className="hidden sm:inline">{userName || "Sign in"}</span>
            {isOfficer && <ShieldCheck size={14} className="text-[#7A2E3A]" />}
          </button>
        </div>
        <nav className="max-w-5xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === n.key ? "border-[#D9A441] text-[#1B4332] font-medium" : "border-transparent text-[#6B6357] hover:text-[#1B4332]"
              }`}
            >
              <n.icon size={15} /> {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {tab === "home" && (
          <Home
            pinned={pinned} unpinned={unpinned} upcoming={upcoming}
            isOfficer={isOfficer} setAnnouncementsP={setAnnouncementsP}
            userName={userName}
          />
        )}
        {tab === "members" && (
          <Members members={members} setMembersP={setMembersP} isOfficer={isOfficer} />
        )}
        {tab === "events" && (
          <Events events={events} setEventsP={setEventsP} isOfficer={isOfficer} userName={userName} onNeedName={() => setShowSignIn(true)} />
        )}
        {tab === "learning" && (
          <Learning resources={resources} setResourcesP={setResourcesP} isOfficer={isOfficer} />
        )}
        {tab === "chat" && (
          <ChatHub userName={userName} onNeedName={() => setShowSignIn(true)} />
        )}
      </main>

      <footer className="border-t border-[#E3DCC9] py-6 text-center text-xs text-[#6B6357]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
        <div className="flex items-center justify-center gap-4 flex-wrap mb-3">
          <a href="https://www.facebook.com/share/1JRmp87X58/" target="_blank" rel="noreferrer" className="hover:text-[#1B4332] hover:underline">BSPA-NCF Chapter Facebook</a>
          <a href="https://www.facebook.com/nagacollegefoundation1947/" target="_blank" rel="noreferrer" className="hover:text-[#1B4332] hover:underline">NCF Facebook</a>
        </div>
        <div className="flex items-center justify-center gap-1.5"><Mountain size={13} /> SERVICE WITH A SMILE • MUNUS CUM RISU</div>
      </footer>

      {showSignIn && (
        <SignInModal
          initialName={userName}
          onClose={() => setShowSignIn(false)}
          onSubmit={signIn}
        />
      )}
    </div>
  );
}
function SignInModal({ initialName, onClose, onSubmit }) {
  const [name, setName] = useState(initialName || "");
  const [officer, setOfficer] = useState(false);
  const isAllowedAdmin = name.trim().toLowerCase() === ADMIN_NAME.toLowerCase();
  const blocked = officer && !isAllowedAdmin;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-[#1B4332]" style={{ fontFamily: "Fraunces, serif", fontWeight: 700 }}>Sign in</h3>
          <button onClick={onClose}><X size={18} className="text-[#6B6357]" /></button>
        </div>
        <label className="text-xs uppercase tracking-wide text-[#6B6357]">Your name</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juan Dela Cruz"
          className="w-full mt-1 mb-4 px-3 py-2 border border-[#E3DCC9] rounded bg-white text-sm focus:outline-none focus:border-[#1B4332]"
        />
        <label className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
          <input type="checkbox" checked={officer} onChange={(e) => setOfficer(e.target.checked)} />
          Sign in as officer / admin
        </label>
        {blocked && (
          <div className="text-xs text-[#7A2E3A] mb-4">
            Admin access is limited to {ADMIN_NAME}. Enter that exact name to continue as admin, or uncheck the box to sign in as a member.
          </div>
        )}
        <div className={blocked ? "" : "mb-5"} />
        <button
          disabled={!name.trim() || blocked}
          onClick={() => onSubmit(name.trim(), officer)}
          className="btn-primary w-full py-2 rounded text-sm font-medium disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Home({ pinned, unpinned, upcoming, isOfficer, setAnnouncementsP, userName }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", pinned: false });

  const post = () => {
    if (!draft.title.trim() || !draft.body.trim()) return;
    setAnnouncementsP((prev) => [
      { id: uid(), title: draft.title, body: draft.body, date: todayISO(), author: userName || "Officer", pinned: draft.pinned },
      ...prev,
    ]);
    setDraft({ title: "", body: "", pinned: false });
    setShowForm(false);
  };
  const remove = (id) => setAnnouncementsP((prev) => prev.filter((a) => a.id !== id));

  return (
    <>
      <div className="rounded-lg mb-10 overflow-hidden card">
        <div className="p-6 md:p-8 bg-[#1B4332] text-[#F5F1E6] relative overflow-hidden">
          <svg className="absolute right-0 bottom-0 opacity-20" width="220" height="120" viewBox="0 0 220 120">
            <path d="M0,120 L70,30 Q76,22 82,30 L92,44 L112,14 Q118,6 124,14 L220,120 Z" fill="#D9A441" />
          </svg>
          <div className="relative">
            <div className="text-[11px] tracking-[0.2em] uppercase text-[#D9A441] font-semibold" style={{ fontFamily: "IBM Plex Mono, monospace" }}>Welcome</div>
            <h2 className="text-2xl md:text-3xl mt-1 max-w-lg" style={{ fontFamily: "Fraunces, serif", fontWeight: 700 }}>
              One chapter, one bayanihan — governance starts with us.
            </h2>
          </div>
        </div>
      </div>

      <Section
        icon={Megaphone} eyebrow="Bulletin" title="Announcements"
        action={isOfficer && (
          <button onClick={() => setShowForm((s) => !s)} className="btn-gold text-sm px-3 py-1.5 rounded flex items-center gap-1">
            <Plus size={15} /> Post
          </button>
        )}
      >
        {showForm && (
          <div className="card rounded-lg p-4 mb-4 space-y-2">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
            <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Details" rows={3} className="w-full px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.pinned} onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })} /> Pin to top</label>
            <button onClick={post} className="btn-primary text-sm px-4 py-2 rounded">Publish</button>
          </div>
        )}
        <div className="space-y-3">
          {pinned.map((a) => <AnnouncementCard key={a.id} a={a} isOfficer={isOfficer} onDelete={remove} />)}
          {unpinned.map((a) => <AnnouncementCard key={a.id} a={a} isOfficer={isOfficer} onDelete={remove} />)}
          {pinned.length + unpinned.length === 0 && <Empty text="No announcements yet." />}
        </div>
      </Section>

      <Section icon={CalendarDays} eyebrow="What's next" title="Upcoming events">
        <div className="grid sm:grid-cols-2 gap-3">
          {upcoming.slice(0, 4).map((e) => (
            <div key={e.id} className="card rounded-lg p-4">
              <div className="text-xs text-[#7A2E3A] font-medium" style={{ fontFamily: "IBM Plex Mono, monospace" }}>{e.date} · {e.time}</div>
              <div className="font-medium text-[#1B4332] mt-1">{e.title}</div>
              <div className="text-xs text-[#6B6357] flex items-center gap-1 mt-1"><MapPin size={12} /> {e.location}</div>
            </div>
          ))}
          {upcoming.length === 0 && <Empty text="No events scheduled." />}
        </div>
      </Section>
    </>
  );
}

function AnnouncementCard({ a, isOfficer, onDelete }) {
  return (
    <div className="card rounded-lg p-4 relative">
      {a.pinned && <Pin size={13} className="absolute top-4 right-4 text-[#D9A441]" />}
      <div className="text-[11px] text-[#6B6357]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>{a.date} · {a.author}</div>
      <div className="font-medium text-[#1B4332] mt-1 pr-6">{a.title}</div>
      <p className="text-sm text-[#22201B]/80 mt-1 leading-relaxed">{a.body}</p>
      {isOfficer && (
        <button onClick={() => onDelete(a.id)} className="text-xs text-[#7A2E3A] mt-2 flex items-center gap-1 hover:underline">
          <Trash2 size={12} /> Remove
        </button>
      )}
    </div>
  );
}

function Members({ members, setMembersP, isOfficer }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", position: "Member", course: "", email: "", bio: "" });

  const add = () => {
    if (!draft.name.trim()) return;
    setMembersP((prev) => [...prev, { id: uid(), ...draft }]);
    setDraft({ name: "", position: "Member", course: "", email: "", bio: "" });
    setShowForm(false);
  };
  const remove = (id) => setMembersP((prev) => prev.filter((m) => m.id !== id));

  const officers = members.filter((m) => m.position !== "Member");
  const rank = members.filter((m) => m.position === "Member");

  return (
    <Section
      icon={Users} eyebrow={`${members.length} total · ${OFFICER_TERM}`} title="Chapter directory"
      action={isOfficer && (
        <button onClick={() => setShowForm((s) => !s)} className="btn-gold text-sm px-3 py-1.5 rounded flex items-center gap-1">
          <Plus size={15} /> Add member
        </button>
      )}
    >
      {showForm && (
        <div className="card rounded-lg p-4 mb-5 grid sm:grid-cols-2 gap-2">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} placeholder="Position (e.g. Member, Secretary)" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <input value={draft.course} onChange={(e) => setDraft({ ...draft, course: e.target.value })} placeholder="Year & block (e.g. BPA-II)" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="Email" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="Short bio (optional)" className="sm:col-span-2 px-3 py-2 border border-[#E3DCC9] rounded text-sm" rows={2} />
          <button onClick={add} className="btn-primary text-sm px-4 py-2 rounded sm:col-span-2">Add to directory</button>
        </div>
      )}

      {officers.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wide text-[#7A2E3A] font-semibold mb-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>Officers</div>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {officers.map((m) => <MemberCard key={m.id} m={m} isOfficer={isOfficer} onDelete={remove} />)}
          </div>
        </>
      )}
      <div className="text-xs uppercase tracking-wide text-[#7A2E3A] font-semibold mb-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>Members</div>
      <div className="grid sm:grid-cols-2 gap-3">
        {rank.map((m) => <MemberCard key={m.id} m={m} isOfficer={isOfficer} onDelete={remove} />)}
        {rank.length === 0 && <Empty text="No members listed yet." />}
      </div>
    </Section>
  );
}

function MemberCard({ m, isOfficer, onDelete }) {
  return (
    <div className="card rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-[#1B4332]">{m.name}</div>
          <div className="text-xs text-[#7A2E3A]">{m.position}{m.course ? ` · ${m.course}` : ""}</div>
        </div>
        {isOfficer && <button onClick={() => onDelete(m.id)}><Trash2 size={14} className="text-[#6B6357] hover:text-[#7A2E3A]" /></button>}
      </div>
      {m.bio && <p className="text-sm text-[#22201B]/75 mt-2">{m.bio}</p>}
      {m.email && <div className="text-xs text-[#6B6357] mt-2">{m.email}</div>}
    </div>
  );
}
function Events({ events, setEventsP, isOfficer, userName, onNeedName }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", date: "", time: "", location: "", description: "", category: "" });
  const [filter, setFilter] = useState("All");

  const add = () => {
    if (!draft.title.trim() || !draft.date) return;
    setEventsP((prev) => [...prev, { id: uid(), attendees: [], ...draft }]);
    setDraft({ title: "", date: "", time: "", location: "", description: "", category: "" });
    setShowForm(false);
  };
  const remove = (id) => setEventsP((prev) => prev.filter((e) => e.id !== id));
  const toggleRSVP = (id) => {
    if (!userName) { onNeedName(); return; }
    setEventsP((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const going = e.attendees.includes(userName);
      return { ...e, attendees: going ? e.attendees.filter((n) => n !== userName) : [...e.attendees, userName] };
    }));
  };

  const sorted = [...events]
    .filter((e) => filter === "All" || e.category === filter)
    .sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1));

  return (
    <Section
      icon={CalendarDays} eyebrow={`${events.length} scheduled`} title="Events & attendance"
      action={isOfficer && (
        <button onClick={() => setShowForm((s) => !s)} className="btn-gold text-sm px-3 py-1.5 rounded flex items-center gap-1">
          <Plus size={15} /> New event
        </button>
      )}
    >
      {showForm && (
        <div className="card rounded-lg p-4 mb-5 grid sm:grid-cols-2 gap-2">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Event title" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm sm:col-span-2" />
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Location" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm sm:col-span-2" />
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" rows={2} className="px-3 py-2 border border-[#E3DCC9] rounded text-sm sm:col-span-2" />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="px-3 py-2 border border-[#E3DCC9] rounded text-sm sm:col-span-2 bg-white">
            <option value="">No category</option>
            {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={add} className="btn-primary text-sm px-4 py-2 rounded sm:col-span-2">Create event</button>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {["All", ...EVENT_CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`text-xs px-3 py-1.5 rounded-full border ${filter === c ? "bg-[#1B4332] text-[#F5F1E6] border-[#1B4332]" : "border-[#E3DCC9] text-[#6B6357]"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map((e) => {
          const going = userName && e.attendees.includes(userName);
          return (
            <div key={e.id} className="card rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-[#7A2E3A] font-medium flex items-center gap-3" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                    <span>{e.date}</span>
                    {e.time && <span className="flex items-center gap-1"><Clock size={12} /> {e.time}</span>}
                  </div>
                  {e.category && (
                    <div className="text-[10px] uppercase tracking-wide text-[#D9A441] font-semibold bg-[#1B4332] px-2 py-0.5 rounded inline-block mt-1" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                      {e.category}
                    </div>
                  )}
                  <div className="font-medium text-[#1B4332] mt-1">{e.title}</div>
                  {e.location && <div className="text-xs text-[#6B6357] flex items-center gap-1 mt-0.5"><MapPin size={12} /> {e.location}</div>}
                  {e.description && <p className="text-sm text-[#22201B]/75 mt-2">{e.description}</p>}
                  <div className="text-xs text-[#6B6357] mt-2">{e.attendees.length} attending{isOfficer && e.attendees.length > 0 ? `: ${e.attendees.join(", ")}` : ""}</div>
                </div>
                {isOfficer && <button onClick={() => remove(e.id)}><Trash2 size={14} className="text-[#6B6357] hover:text-[#7A2E3A]" /></button>}
              </div>
              <button
                onClick={() => toggleRSVP(e.id)}
                className={`mt-3 text-sm px-3 py-1.5 rounded ${going ? "border border-[#1B4332] text-[#1B4332]" : "btn-primary"}`}
              >
                {going ? "You're attending ✓" : "I'll attend"}
              </button>
            </div>
          );
        })}
        {sorted.length === 0 && <Empty text="No events yet." />}
      </div>
    </Section>
  );
}

function Learning({ resources, setResourcesP, isOfficer }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", url: "", category: "Reviewers" });
  const [filter, setFilter] = useState("All");

  const add = () => {
    if (!draft.title.trim()) return;
    setResourcesP((prev) => [...prev, { id: uid(), ...draft }]);
    setDraft({ title: "", description: "", url: "", category: "Reviewers" });
    setShowForm(false);
  };
  const remove = (id) => setResourcesP((prev) => prev.filter((r) => r.id !== id));

  const categories = ["All", ...Array.from(new Set(resources.map((r) => r.category)))];
  const shown = filter === "All" ? resources : resources.filter((r) => r.category === filter);

  return (
    <Section
      icon={BookOpen} eyebrow="Study materials" title="Learning hub"
      action={isOfficer && (
        <button onClick={() => setShowForm((s) => !s)} className="btn-gold text-sm px-3 py-1.5 rounded flex items-center gap-1">
          <Plus size={15} /> Add resource
        </button>
      )}
    >
      {showForm && (
        <div className="card rounded-lg p-4 mb-5 grid sm:grid-cols-2 gap-2">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Resource title" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm sm:col-span-2" />
          <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Category (e.g. Reviewers, Notes, Guides)" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="Link (URL)" className="px-3 py-2 border border-[#E3DCC9] rounded text-sm" />
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Short description" rows={2} className="px-3 py-2 border border-[#E3DCC9] rounded text-sm sm:col-span-2" />
          <button onClick={add} className="btn-primary text-sm px-4 py-2 rounded sm:col-span-2">Add to hub</button>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`text-xs px-3 py-1.5 rounded-full border ${filter === c ? "bg-[#1B4332] text-[#F5F1E6] border-[#1B4332]" : "border-[#E3DCC9] text-[#6B6357]"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {shown.map((r) => (
          <div key={r.id} className="card rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="text-[10px] uppercase tracking-wide text-[#D9A441] font-semibold bg-[#1B4332] px-2 py-0.5 rounded inline-block" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                {r.category}
              </div>
              {isOfficer && <button onClick={() => remove(r.id)}><Trash2 size={14} className="text-[#6B6357] hover:text-[#7A2E3A]" /></button>}
            </div>
            <div className="font-medium text-[#1B4332] mt-2">{r.title}</div>
            {r.description && <p className="text-sm text-[#22201B]/75 mt-1">{r.description}</p>}
            {r.url && (
              <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-[#7A2E3A] flex items-center gap-1 mt-2 hover:underline">
                <LinkIcon size={12} /> Open resource <ChevronRight size={12} />
              </a>
            )}
          </div>
        ))}
        {shown.length === 0 && <Empty text="No resources in this category yet." />}
      </div>
    </Section>
  );
}
function ChatHub({ userName, onNeedName }) {
  const [sub, setSub] = useState("group");
  return (
    <Section icon={MessageCircle} eyebrow="Talk it over" title="Chat">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSub("group")}
          className={`text-sm px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${sub === "group" ? "bg-[#1B4332] text-[#F5F1E6] border-[#1B4332]" : "border-[#E3DCC9] text-[#6B6357]"}`}
        >
          <MessageCircle size={14} /> Chapter Chat
        </button>
        {AI_ASSISTANT_ENABLED && (
          <button
            onClick={() => setSub("ai")}
            className={`text-sm px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${sub === "ai" ? "bg-[#1B4332] text-[#F5F1E6] border-[#1B4332]" : "border-[#E3DCC9] text-[#6B6357]"}`}
          >
            <Sparkles size={14} /> AI Assistant
          </button>
        )}
      </div>
      {sub === "ai" && AI_ASSISTANT_ENABLED
        ? <AiAssistant />
        : <GroupChat userName={userName} onNeedName={onNeedName} />}
    </Section>
  );
}

function GroupChat({ userName, onNeedName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const bottomRef = React.useRef(null);

  const refresh = useCallback(async () => {
    const m = await loadShared("chatMessages", []);
    setMessages(m);
  }, []);

  useEffect(() => {
    refresh().then(() => setLoaded(true));
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    if (!userName) { onNeedName(); return; }
    const next = [...messages, { id: uid(), author: userName, text: text.trim(), ts: Date.now() }].slice(-200);
    setMessages(next);
    setText("");
    await saveShared("chatMessages", next);
  };

  return (
    <div className="card rounded-lg flex flex-col h-[28rem]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loaded && messages.length === 0 && <Empty text="No messages yet — say hello to the chapter." />}
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] ${m.author === userName ? "ml-auto text-right" : ""}`}>
            <div className="text-[10px] text-[#6B6357]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              {m.author} · {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className={`inline-block mt-1 px-3 py-2 rounded-lg text-sm ${m.author === userName ? "bg-[#1B4332] text-[#F5F1E6]" : "bg-[#F5F1E6] text-[#22201B]"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[#E3DCC9] p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={userName ? "Message the chapter…" : "Sign in to chat…"}
          className="flex-1 px-3 py-2 border border-[#E3DCC9] rounded text-sm focus:outline-none focus:border-[#1B4332]"
        />
        <button onClick={send} className="btn-primary px-3 py-2 rounded"><Send size={16} /></button>
      </div>
    </div>
  );
}

function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Kumusta! I'm the BSPA-NCF assistant. Ask me about public administration concepts, the Local Government Code, the Constitution, CSC processes, or chapter matters." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = React.useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => m.role === "user" || m.role === "assistant"),
        }),
      });
      const data = await response.json();
      const replyText = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n") || "Sorry, I couldn't generate a reply just now.";
      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong reaching the assistant. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card rounded-lg flex flex-col h-[28rem]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : ""}`}>
            <div className="text-[10px] text-[#6B6357] flex items-center gap-1" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
              {m.role === "assistant" && <Sparkles size={11} className="text-[#D9A441]" />}
              {m.role === "assistant" ? "Assistant" : "You"}
            </div>
            <div className={`inline-block mt-1 px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[#1B4332] text-[#F5F1E6]" : "bg-[#F5F1E6] text-[#22201B]"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="text-xs text-[#6B6357] italic">thinking…</div>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[#E3DCC9] p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask the assistant…"
          className="flex-1 px-3 py-2 border border-[#E3DCC9] rounded text-sm focus:outline-none focus:border-[#1B4332]"
        />
        <button onClick={send} disabled={busy} className="btn-primary px-3 py-2 rounded disabled:opacity-40"><Send size={16} /></button>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-sm text-[#6B6357] italic py-6 text-center col-span-2">{text}</div>;
}
