import React from "react";
import { Share2, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="md:ml-64 bg-slate-50 dark:bg-slate-900 w-full py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-indigo-900 dark:text-white uppercase tracking-widest text-sm">Ilm Gah Admin Console</span>
          <p className="font-sans text-xs uppercase tracking-widest text-slate-500">© 2024 Ilm Gah Scholarly Atelier. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#">Privacy Policy</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#">Terms of Service</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#">Library Ethics</a>
          <a className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="#">Contact Support</a>
        </div>
        <div className="flex gap-4">
          <button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-indigo-900 dark:text-white hover:bg-indigo-900 hover:text-white transition-all">
            <Share2 size={14} />
          </button>
          <button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-indigo-900 dark:text-white hover:bg-indigo-900 hover:text-white transition-all">
            <Globe size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
