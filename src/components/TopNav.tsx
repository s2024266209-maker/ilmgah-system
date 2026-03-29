import React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";

interface TopNavProps {
  showSearch?: boolean;
  showLinks?: boolean;
}

export function TopNav({ showSearch = true, showLinks = false }: TopNavProps) {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[0_20px_40px_rgba(26,35,126,0.06)] font-headline antialiased tracking-tight h-16 flex justify-between items-center px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-indigo-900">
          <Menu size={24} />
        </button>
        
        {showSearch && (
          <div className="hidden sm:flex items-center bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
            <Search size={16} className="text-slate-400" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 text-indigo-900 placeholder:text-slate-400" 
              placeholder="Search the archives..." 
              type="text"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {showLinks && (
          <nav className="hidden lg:flex items-center gap-6 text-sm">
            <Link className="text-indigo-900 dark:text-white font-semibold border-b-2 border-amber-400 transition-colors duration-300" to="/admin">Overview</Link>
            <Link className="text-slate-500 dark:text-slate-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-300" to="/analytics">Analytics</Link>
            <Link className="text-slate-500 dark:text-slate-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors duration-300" to="/reports">Reports</Link>
          </nav>
        )}
        
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-6">
          <button className="text-slate-500 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full border-2 border-slate-50"></span>
          </button>
          <img 
            alt="User Profile Avatar" 
            className="w-8 h-8 rounded-full border border-slate-200" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfSSU8u3nDx3mvDQPjQm-ANxBoIiOPU207MUmxXMNYDHmmrlSdtP0KjKntgzcvbIR8tyXex_5q5EEle-SX0In7AJrRUjqDc9NIrvBmfwxCtBTFNW6gCnN12MR7BOdHxpTwK_eXRki1JQdq0XereotEqNT-tv1tysSTvnUcVHLsK3GxGBDDTwwriTmVjl2QFBUsFh258LZ0LkAznGWlNhBS4s34-sAtqcD5v1enQOQ985TPIxUhrrrQN2trSmC6SErXxufLtr53oFCZ"
          />
        </div>
      </div>
    </header>
  );
}
