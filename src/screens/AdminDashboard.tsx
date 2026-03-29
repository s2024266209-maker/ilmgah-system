import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Clock, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  Plus, 
  Download, 
  Filter, 
  CheckCircle2, 
  Archive, 
  History,
  LayoutDashboard,
  Library,
  BookmarkCheck,
  ReceiptText,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Menu
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

import { db } from "../firebase";
import { collection, query, where, onSnapshot, getDocs, orderBy, limit } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

const data = [
  { name: "Mon", borrows: 40, returns: 24 },
  { name: "Tue", borrows: 30, returns: 13 },
  { name: "Wed", borrows: 20, returns: 98 },
  { name: "Thu", borrows: 27, returns: 39 },
  { name: "Fri", borrows: 18, returns: 48 },
  { name: "Sat", borrows: 23, returns: 38 },
  { name: "Sun", borrows: 34, returns: 43 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBooks: 0,
    activeTransactions: 0,
    pendingFines: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen to Users Count
    const usersUnsub = onSnapshot(query(collection(db, "users"), where("role", "==", "student")), (snapshot) => {
      setStats(prev => ({ ...prev, totalStudents: snapshot.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users"));

    // 2. Listen to Books Count
    const booksUnsub = onSnapshot(collection(db, "books"), (snapshot) => {
      setStats(prev => ({ ...prev, totalBooks: snapshot.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "books"));

    // 3. Listen to Transactions for Active Loans and Fines
    const transUnsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      let active = 0;
      let fines = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === "borrowed") active++;
        fines += (data.fineAmount || 0);
      });
      setStats(prev => ({ ...prev, activeTransactions: active, pendingFines: fines }));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "transactions"));

    // 4. Listen to Recent Activity
    const activityUnsub = onSnapshot(query(collection(db, "transactions"), orderBy("timestamp", "desc"), limit(4)), (snapshot) => {
      setRecentActivity(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          user: data.userName || "Unknown User",
          action: `${data.type === 'borrow' ? 'Borrowed' : 'Returned'} '${data.book?.title || 'Book'}'`,
          time: data.timestamp?.toDate().toLocaleTimeString() || "Just now",
          icon: data.type === 'borrow' ? BookOpen : History,
          color: data.type === 'borrow' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
        };
      }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "transactions"));

    return () => {
      usersUnsub();
      booksUnsub();
      transUnsub();
      activityUnsub();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <TopNav showSearch={true} />
        
        <main className="flex-1 p-8 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Atelier Command Center</h2>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  System operational. Last sync: Just now
                </p>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: "Total Students", value: stats.totalStudents, change: "+12%", icon: Users, color: "text-indigo-600 bg-indigo-50" },
                { label: "Books Inventory", value: stats.totalBooks, change: "+5%", icon: BookOpen, color: "text-amber-600 bg-amber-50" },
                { label: "Active Loans", value: stats.activeTransactions, change: "-4.2%", icon: Clock, color: "text-emerald-600 bg-emerald-50" },
                { label: "Pending Fines", value: `$${stats.pendingFines.toFixed(2)}`, change: "+8%", icon: Wallet, color: "text-red-600 bg-red-50" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-2xl", stat.color)}>
                      <stat.icon size={24} />
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-lg",
                      stat.change.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? "..." : stat.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-slate-900">Circulation Trends</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">Weekly</button>
                    <button className="px-4 py-1.5 text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50">Monthly</button>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="borrows" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-8">Recent Activity</h3>
                <div className="space-y-6">
                  {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", activity.color)}>
                        <activity.icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{activity.user}</p>
                        <p className="text-xs text-slate-500">{activity.action}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{activity.time}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-400 text-sm italic">No recent activity found.</p>
                  )}
                </div>
                <Link to="/admin/transactions" className="w-full mt-8 py-3 bg-slate-50 text-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition-all flex justify-center items-center">
                  View All Activity
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Catalog Management", desc: "Add or update book inventory", icon: Library, action: "Manage Books", link: "/admin/books" },
                { title: "User Administration", desc: "Manage student and staff accounts", icon: Users, action: "Manage Users", link: "/admin/users" },
                { title: "Financial Reports", desc: "View fine collection and revenue", icon: ReceiptText, action: "View Reports", link: "/admin/transactions" },
              ].map((action, i) => (
                <div key={i} className="bg-indigo-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <action.icon size={32} className="mb-6 text-indigo-300" />
                    <h4 className="text-xl font-bold mb-2">{action.title}</h4>
                    <p className="text-indigo-200 text-sm mb-8 leading-relaxed">{action.desc}</p>
                    <Link 
                      to={action.link}
                      className="inline-block bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all"
                    >
                      {action.action}
                    </Link>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
