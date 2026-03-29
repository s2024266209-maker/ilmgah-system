import { Stat, Guild, LogEntry, Borrowing, Recommendation } from "./types";

export const ADMIN_STATS: Stat[] = [
  { label: "Total Scholars", value: "12,842", change: "+12%", icon: "Users", color: "text-indigo-600 bg-indigo-50" },
  { label: "Manuscripts", value: "45,109", status: "Stable", icon: "BookOpen", color: "text-amber-600 bg-amber-50" },
  { label: "Overdue Items", value: "184", change: "-4.2%", icon: "Clock", color: "text-red-600 bg-red-50" },
  { label: "Mastery Fines", value: "$4,290.50", change: "+8%", icon: "Wallet", color: "text-yellow-600 bg-yellow-50" },
];

export const SCHOLAR_STATS: Stat[] = [
  { label: "Total Borrowed", value: "12", icon: "BookOpen", color: "text-indigo-600 bg-indigo-50" },
  { label: "Due Within 48h", value: "02", status: "Attention", icon: "Clock", color: "text-amber-600 bg-amber-50" },
  { label: "Active Reservations", value: "05", icon: "Bookmark", color: "text-indigo-600 bg-indigo-50" },
  { label: "Outstanding Fines", value: "$14.50", status: "Overdue", icon: "Wallet", color: "text-red-600 bg-red-50" },
];

export const GUILDS: Guild[] = [
  { id: "1", name: "Philosophy", borrows: "3.4k borrows", trend: "up", initials: "PH", color: "bg-amber-100 text-amber-900" },
  { id: "2", name: "Natural Sciences", borrows: "2.8k borrows", trend: "up", initials: "SC", color: "bg-indigo-100 text-indigo-900" },
  { id: "3", name: "Alchemy & Chem", borrows: "1.9k borrows", trend: "stable", initials: "AL", color: "bg-slate-100 text-slate-900" },
];

export const LOGS: LogEntry[] = [
  {
    id: "1",
    action: "New Manuscript Cataloged",
    entity: "The Republic (Deluxe Ed.)",
    registrar: { name: "Dr. Aris Thorne", avatar: "https://i.pravatar.cc/150?u=aris" },
    timestamp: "2 mins ago",
    status: "ARCHIVED",
  },
  {
    id: "2",
    action: "Scholar Induction",
    entity: "Julian Vance (Gold Tier)",
    registrar: { name: "System Auto-Registry", avatar: "https://i.pravatar.cc/150?u=system" },
    timestamp: "14 mins ago",
    status: "VERIFIED",
  },
  {
    id: "3",
    action: "Transaction Cleared",
    entity: "Fine #8829 - Late Return",
    registrar: { name: "Helena Moss", avatar: "https://i.pravatar.cc/150?u=helena" },
    timestamp: "42 mins ago",
    status: "SETTLED",
  },
];

export const BORROWINGS: Borrowing[] = [
  {
    id: "1",
    title: "The Muqaddimah: An Introduction to History",
    author: "Ibn Khaldun",
    category: "History & Philosophy",
    cover: "https://picsum.photos/seed/muqaddimah/150/225",
    progress: 65,
    timeLeft: "6 days left",
  },
  {
    id: "2",
    title: "Principles of Jurisprudence",
    author: "Al-Shafi'i",
    category: "Law",
    cover: "https://picsum.photos/seed/law/150/225",
    progress: 90,
    timeLeft: "Due Today",
    status: "DUE TODAY",
  },
  {
    id: "3",
    title: "The Book of Healing",
    author: "Ibn Sina",
    category: "Science & Medicine",
    cover: "https://picsum.photos/seed/healing/150/225",
    progress: 20,
    timeLeft: "22 days left",
  },
];

export const RECOMMENDATIONS: Recommendation[] = [
  { id: "1", title: "Algebraic Foundations", author: "Al-Khwarizmi", cover: "https://picsum.photos/seed/algebra/150/225" },
  { id: "2", title: "Optics: Kitab al-Manazir", author: "Ibn al-Haytham", cover: "https://picsum.photos/seed/optics/150/225" },
  { id: "3", title: "The Incoherence of Incoherence", author: "Ibn Rushd", cover: "https://picsum.photos/seed/rushd/150/225" },
  { id: "4", title: "The Conference of the Birds", author: "Attar of Nishapur", cover: "https://picsum.photos/seed/birds/150/225" },
];
