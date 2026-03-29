import React, { useState, useEffect } from "react";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Filter,
  ArrowUpDown,
  Download,
  RotateCcw,
  BookOpen,
  User as UserIcon,
  Calendar
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

import { db } from "../firebase";
import { collection, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp, increment } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface Transaction {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  borrowDate: any;
  dueDate: any;
  dueDateObj: Date;
  status: string;
  fineAmount: number;
  book?: { title: string; author: string; cover: string };
  user?: { name: string; email: string };
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          borrowDate: data.borrowDate?.toDate().toLocaleDateString() || "N/A",
          dueDate: data.dueDate?.toDate().toLocaleDateString() || "N/A",
          dueDateObj: data.dueDate?.toDate()
        };
      }) as any[];
      setTransactions(transList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "transactions");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReturn = async (transaction: any) => {
    setMessage(null);
    try {
      const transRef = doc(db, "transactions", transaction.id);
      const bookRef = doc(db, "books", transaction.bookId);

      // 1. Update transaction status
      await updateDoc(transRef, {
        status: "returned",
        returnDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Increment available copies of the book
      await updateDoc(bookRef, {
        availableCopies: increment(1),
        updatedAt: serverTimestamp()
      });

      setMessage({ type: "success", text: "Book returned successfully!" });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${transaction.id}`);
      setMessage({ type: "error", text: "Failed to return book. Check permissions." });
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.book?.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        <TopNav showSearch={false} />
        
        <main className="flex-1 p-8 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Circulation Management</h2>
                <p className="text-slate-500 font-medium">Monitor book borrowings, returns, and overdue items.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  <Download size={20} />
                </button>
                <button className="bg-indigo-900 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-indigo-800 transition-all flex items-center gap-2">
                  <RotateCcw size={20} /> Process Return
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by book title or student name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                  <Filter size={18} /> Filter
                </button>
                <button className="flex-1 md:flex-none px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                  <ArrowUpDown size={18} /> Sort
                </button>
              </div>
            </div>

            {/* Message Toast */}
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-lg",
                    message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}
                >
                  {message.type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  {message.text}
                  <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70">
                    <XCircle size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-bottom border-slate-100">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Book & Student</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fine</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="w-8 h-8 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </td>
                      </tr>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((t) => {
                        const isOverdue = t.dueDateObj < new Date() && t.status === "borrowed";
                        return (
                          <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-14 rounded-lg overflow-hidden shadow-sm shrink-0">
                                  <img src={t.book?.cover} alt={t.book?.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="max-w-[200px]">
                                  <h4 className="font-bold text-slate-900 truncate">{t.book?.title}</h4>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <UserIcon size={12} /> {t.userName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span className="font-bold">Out:</span> {t.borrowDate}
                                </div>
                                <div className={cn(
                                  "flex items-center gap-2 text-xs",
                                  isOverdue ? "text-red-600 font-black" : "text-slate-600"
                                )}>
                                  <Clock size={12} className={isOverdue ? "text-red-600" : "text-slate-400"} />
                                  <span className="font-bold">Due:</span> {t.dueDate}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                t.status === "borrowed" ? (isOverdue ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600") : "bg-emerald-50 text-emerald-600"
                              )}>
                                {t.status === "borrowed" ? (isOverdue ? "Overdue" : "Borrowed") : "Returned"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {t.fineAmount > 0 ? (
                                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                                    <AlertTriangle size={14} />
                                    ${t.fineAmount.toFixed(2)}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {t.status === "borrowed" && (
                                <button 
                                  onClick={() => handleReturn(t)}
                                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-600 transition-all"
                                >
                                  Return
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                          <h3 className="text-lg font-bold text-slate-900 mb-1">No transactions found</h3>
                          <p className="text-slate-500 text-sm">Circulation records will appear here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
