import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Filter,
  ArrowUpDown,
  Download,
  Upload
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
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

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "History",
    totalCopies: 1,
    availableCopies: 1,
    cover: "https://picsum.photos/seed/newbook/150/225",
    description: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (editingBook) {
        const bookRef = doc(db, "books", editingBook.id);
        await updateDoc(bookRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setMessage({ type: "success", text: "Book updated successfully!" });
      } else {
        await addDoc(collection(db, "books"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setMessage({ type: "success", text: "Book added successfully!" });
      }
      
      setIsModalOpen(false);
      setEditingBook(null);
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "History",
        totalCopies: 1,
        availableCopies: 1,
        cover: "https://picsum.photos/seed/newbook/150/225",
        description: ""
      });
    } catch (error) {
      handleFirestoreError(error, editingBook ? OperationType.UPDATE : OperationType.CREATE, "books");
      setMessage({ type: "error", text: "Failed to save book. Check permissions." });
    }
  };

  const handleDelete = async (id: string) => {
    // Custom modal instead of window.confirm
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      await deleteDoc(doc(db, "books", id));
      setMessage({ type: "success", text: "Book deleted successfully!" });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
      setMessage({ type: "error", text: "Failed to delete book. Check permissions." });
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      cover: book.cover,
      description: book.description
    });
    setIsModalOpen(true);
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.includes(searchQuery)
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Book Inventory</h2>
                <p className="text-slate-500 font-medium">Manage library manuscripts and catalog.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  <Download size={20} />
                </button>
                <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  <Upload size={20} />
                </button>
                <button 
                  onClick={() => {setEditingBook(null); setIsModalOpen(true);}}
                  className="bg-indigo-900 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-indigo-800 transition-all flex items-center gap-2"
                >
                  <Plus size={20} /> Add New Book
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by title, author, or ISBN..." 
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
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Details</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ISBN</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</th>
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
                    ) : filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <tr key={book.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-16 rounded-lg overflow-hidden shadow-sm shrink-0">
                                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{book.title}</h4>
                                <p className="text-xs text-slate-500 italic">by {book.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {book.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-slate-600">{book.isbn}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>Available</span>
                                <span>{book.availableCopies}/{book.totalCopies}</span>
                              </div>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    (book.availableCopies / book.totalCopies) < 0.2 ? "bg-red-500" : "bg-indigo-600"
                                  )}
                                  style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(book)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(book.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                          <h3 className="text-lg font-bold text-slate-900 mb-1">No books found</h3>
                          <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingBook ? "Edit Manuscript" : "Add New Manuscript"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <XCircle size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Author</label>
                      <input 
                        required
                        type="text" 
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ISBN</label>
                      <input 
                        required
                        type="text" 
                        value={formData.isbn}
                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                      >
                        <option>History</option>
                        <option>Law</option>
                        <option>Science</option>
                        <option>Mathematics</option>
                        <option>Philosophy</option>
                        <option>Literature</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Copies</label>
                      <input 
                        required
                        type="number" 
                        min="1"
                        value={formData.totalCopies}
                        onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Copies</label>
                      <input 
                        required
                        type="number" 
                        min="0"
                        max={formData.totalCopies}
                        value={formData.availableCopies}
                        onChange={(e) => setFormData({...formData, availableCopies: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-indigo-900 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-800 transition-all"
                    >
                      {editingBook ? "Update Book" : "Add Book"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
