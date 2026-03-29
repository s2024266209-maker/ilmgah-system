import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Clock, 
  Bookmark, 
  Wallet, 
  Search, 
  Bell, 
  ChevronRight, 
  Star, 
  Calendar, 
  ArrowRight, 
  MoreHorizontal, 
  History, 
  Library, 
  BookmarkCheck, 
  Settings, 
  HelpCircle, 
  LogOut, 
  LayoutDashboard,
  Brain,
  Plus,
  User
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { useAuth } from "../components/FirebaseProvider";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDocs, limit } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface Borrowing {
  id: string;
  book: { title: string; author: string; cover: string; category: string };
  dueDate: string;
  progress: number;
  timeLeft: string;
  status?: string;
}

interface Recommendation {
  id: string;
  title: string;
  author: string;
  cover: string;
  reason: string;
}

const ICON_MAP: Record<string, any> = {
  BookOpen,
  Clock,
  Bookmark,
  Wallet,
  Star
};

export default function ScholarDashboard() {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState([
    { label: "Active Borrowings", value: "0", icon: "BookOpen", color: "bg-indigo-50 text-indigo-600" },
    { label: "Reservations", value: "0", icon: "Bookmark", color: "bg-amber-50 text-amber-600" },
    { label: "Pending Fines", value: "$0.00", icon: "Wallet", color: "bg-rose-50 text-rose-600" },
    { label: "Reading Streak", value: "0 Days", icon: "Star", color: "bg-emerald-50 text-emerald-600" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Listen to User Document
    const userUnsub = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    // 2. Listen to Active Borrowings
    const q = query(
      collection(db, "transactions"), 
      where("userId", "==", user.uid),
      where("status", "==", "borrowed")
    );
    
    const transUnsub = onSnapshot(q, (snapshot) => {
      const activeBorrowings = snapshot.docs.map(doc => {
        const data = doc.data();
        const dueDate = data.dueDate?.toDate() || new Date();
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          id: doc.id,
          book: data.book,
          dueDate: dueDate.toISOString(),
          progress: data.progress || Math.floor(Math.random() * 60) + 20,
          timeLeft: diffDays > 0 ? `${diffDays} days left` : diffDays === 0 ? "Due today" : `${Math.abs(diffDays)} days overdue`,
          status: diffDays <= 0 ? "DUE TODAY" : undefined
        };
      });

      setBorrowings(activeBorrowings);
      
      // Update stats based on borrowings
      setStats(prev => prev.map(s => {
        if (s.label === "Active Borrowings") return { ...s, value: activeBorrowings.length.toString() };
        if (s.label === "Pending Fines") {
          const totalFine = snapshot.docs.reduce((acc, d) => acc + (d.data().fineAmount || 0), 0);
          return { ...s, value: `$${totalFine.toFixed(2)}` };
        }
        return s;
      }));
      
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "transactions"));

    // 3. Fetch Recommendations (just some books)
    const fetchRecs = async () => {
      try {
        const booksSnap = await getDocs(query(collection(db, "books"), limit(4)));
        setRecommendations(booksSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            author: data.author,
            cover: data.cover,
            reason: "Based on your interest in " + data.category
          };
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "books");
      }
    };
    fetchRecs();

    return () => {
      userUnsub();
      transUnsub();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased">
      <Sidebar />
      <TopNav showSearch={true} />
      
      <main className="md:ml-64 pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img 
                alt="Scholar Avatar" 
                className="w-20 h-20 rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl" 
                src="https://picsum.photos/seed/scholar/200/200"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                <Star size={14} className="text-white fill-white" />
              </div>
            </div>
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-indigo-950 dark:text-indigo-100 tracking-tighter mb-1">
                Welcome, Scholar {userData?.name?.split(' ')[0] || 'User'}.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <Calendar size={14} />
                {userData?.role === 'admin' ? 'Administrator' : 'Scholar'} • Member since {userData?.createdAt?.toDate().toLocaleDateString() || 'Recently'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/transactions" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
              <History size={18} />
              History
            </Link>
            <Link to="/catalog" className="primary-gradient text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
              <Search size={18} />
              Explore Catalog
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => {
            const Icon = ICON_MAP[stat.icon];
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-[0_10px_30px_rgba(26,35,126,0.04)] border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={cn("p-3 rounded-xl", stat.color)}>
                    <Icon size={24} />
                  </div>
                  <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="relative z-10">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 block">{stat.label}</span>
                  <h3 className="text-2xl font-black text-indigo-950 dark:text-indigo-100 tracking-tighter">{loading ? "..." : stat.value}</h3>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              </motion.div>
            );
          })}
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Borrowings */}
          <section className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_rgba(26,35,126,0.05)] border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="font-headline text-xl font-extrabold text-indigo-950 dark:text-indigo-100 tracking-tight flex items-center gap-3">
                  <BookOpen size={20} className="text-indigo-600" />
                  Active Borrowings
                </h3>
                <Link to="/catalog" className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              
              <div className="p-8 space-y-8">
                {borrowings.length > 0 ? borrowings.map((book) => (
                  <div key={book.id} className="flex flex-col sm:flex-row gap-6 group cursor-pointer">
                    <div className="relative shrink-0">
                      <img 
                        alt={book.book.title} 
                        className="w-32 h-48 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500 object-cover" 
                        src={book.book.cover}
                      />
                      {book.status === "DUE TODAY" && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md shadow-lg animate-pulse">
                          DUE TODAY
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1 block">{book.book.category}</span>
                        <h4 className="text-xl font-bold text-indigo-950 dark:text-indigo-100 mb-1 group-hover:text-indigo-600 transition-colors">{book.book.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic">by {book.book.author}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400 uppercase tracking-widest">Reading Progress</span>
                          <span className="text-indigo-950 dark:text-indigo-100">{book.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${book.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                          <Clock size={14} />
                          {book.timeLeft}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                      <button className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <Bookmark size={20} />
                      </button>
                      <button className="bg-indigo-50 dark:bg-slate-800 p-3 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">No active borrowings. Time to explore the catalog!</p>
                    <Link to="/catalog" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">Go to Catalog</Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section className="flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_20px_60px_rgba(26,35,126,0.05)] border border-slate-100 dark:border-slate-800">
              <h3 className="font-headline text-xl font-extrabold text-indigo-950 dark:text-indigo-100 tracking-tight mb-8">Neural Curations</h3>
              <div className="grid grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="group cursor-pointer">
                    <div className="relative mb-3 overflow-hidden rounded-xl shadow-md">
                      <img 
                        alt={rec.title} 
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" 
                        src={rec.cover}
                      />
                      <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-100 line-clamp-1 group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium italic">{rec.author}</p>
                  </div>
                ))}
              </div>
              <Link to="/catalog" className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all font-bold text-sm flex justify-center items-center">
                Explore More
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="primary-gradient p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
              <h3 className="text-lg font-bold mb-4 relative z-10">Library Ethics</h3>
              <p className="text-white/70 text-sm mb-6 relative z-10 leading-relaxed">Remember to handle manuscripts with care. Late returns impact the scholarly community.</p>
              <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform relative z-10">
                Read Guidelines
              </button>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
