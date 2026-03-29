import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  Info,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Grid,
  List as ListIcon,
  Share2
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

import { useAuth } from "../components/FirebaseProvider";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp, increment } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  cover: string;
  description: string;
}

export default function Catalog() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const categories = ["All", "History", "Law", "Science", "Mathematics", "Philosophy", "Literature"];

  useEffect(() => {
    const q = query(collection(db, "books"), orderBy("title", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(booksList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "books");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBorrow = async (book: Book) => {
    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to borrow books." });
      return;
    }

    if (book.availableCopies <= 0) {
      setMessage({ type: "error", text: "No copies available for borrowing." });
      return;
    }

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks due date

      // 1. Create transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        userName: user.displayName || "Scholar",
        bookId: book.id,
        book: {
          title: book.title,
          author: book.author,
          cover: book.cover
        },
        borrowDate: serverTimestamp(),
        dueDate: dueDate,
        status: "borrowed",
        fineAmount: 0,
        timestamp: serverTimestamp()
      });

      // 2. Decrement available copies
      const bookRef = doc(db, "books", book.id);
      await updateDoc(bookRef, {
        availableCopies: increment(-1),
        updatedAt: serverTimestamp()
      });

      setMessage({ type: "success", text: "Book borrowed successfully!" });
      setSelectedBook(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "transactions");
      setMessage({ type: "error", text: "Failed to borrow book. Check permissions." });
    }
  };

  const handleReserve = async (book: Book) => {
    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to reserve books." });
      return;
    }

    try {
      await addDoc(collection(db, "reservations"), {
        userId: user.uid,
        userName: user.displayName || "Scholar",
        bookId: book.id,
        bookTitle: book.title,
        status: "pending",
        timestamp: serverTimestamp()
      });

      setMessage({ type: "success", text: "Book reserved successfully!" });
      setSelectedBook(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "reservations");
      setMessage({ type: "error", text: "Failed to reserve book. Check permissions." });
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.isbn.includes(searchQuery);
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Library Catalog</h2>
                <p className="text-slate-500 font-medium">Explore and discover scholarly manuscripts.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-indigo-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600")}
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-indigo-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600")}
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
              <div className="lg:col-span-3 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by title, author, or ISBN..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
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

            {/* Books Display */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className={cn(
                "grid gap-8",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {filteredBooks.map((book) => (
                  <motion.div 
                    layout
                    key={book.id}
                    whileHover={{ y: -10 }}
                    className={cn(
                      "bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500",
                      viewMode === "list" && "flex flex-row"
                    )}
                  >
                    <div className={cn(
                      "relative overflow-hidden",
                      viewMode === "grid" ? "h-64" : "w-48 h-64 shrink-0"
                    )}>
                      <img 
                        src={book.cover} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setSelectedBook(book)}
                          className="bg-white text-indigo-900 p-3 rounded-xl shadow-xl hover:scale-110 transition-transform"
                        >
                          <Info size={24} />
                        </button>
                      </div>
                      <div className={cn(
                        "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg",
                        book.availableCopies > 0 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                      )}>
                        {book.availableCopies > 0 ? "Available" : "Reserved Only"}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 block">{book.category}</span>
                        <h4 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{book.title}</h4>
                        <p className="text-sm text-slate-500 italic">by {book.author}</p>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {book.availableCopies} of {book.totalCopies} left
                        </div>
                        {book.availableCopies > 0 ? (
                          <button 
                            onClick={() => handleBorrow(book)}
                            className="bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-800 transition-all flex items-center gap-2"
                          >
                            Borrow <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleReserve(book)}
                            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 transition-all flex items-center gap-2"
                          >
                            Reserve <Bookmark size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No manuscripts found</h3>
                <p className="text-slate-500">Try adjusting your search or category filter.</p>
                <button 
                  onClick={() => {setSearchQuery(""); setSelectedCategory("All");}}
                  className="mt-6 text-indigo-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Book Details Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row"
            >
              <div className="md:w-2/5 h-64 md:h-auto relative">
                <img src={selectedBook.cover} alt={selectedBook.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent md:hidden" />
              </div>
              <div className="p-8 md:p-12 flex-1 flex flex-col">
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle size={24} />
                </button>
                
                <div className="mb-8">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-2 block">{selectedBook.category}</span>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{selectedBook.title}</h3>
                  <p className="text-lg text-slate-500 italic mb-6">by {selectedBook.author}</p>
                  <div className="flex gap-4 mb-8">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ISBN</span>
                      <span className="text-sm font-bold text-slate-700">{selectedBook.isbn}</span>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Availability</span>
                      <span className={cn("text-sm font-bold", selectedBook.availableCopies > 0 ? "text-emerald-600" : "text-amber-600")}>
                        {selectedBook.availableCopies} of {selectedBook.totalCopies}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{selectedBook.description}</p>
                </div>

                <div className="mt-auto flex gap-4">
                  {selectedBook.availableCopies > 0 ? (
                    <button 
                      onClick={() => handleBorrow(selectedBook)}
                      className="flex-1 bg-indigo-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      Borrow Manuscript
                      <ArrowRight size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReserve(selectedBook)}
                      className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      Reserve Manuscript
                      <Bookmark size={20} />
                    </button>
                  )}
                  <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
