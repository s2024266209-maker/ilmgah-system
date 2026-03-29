import React from "react";
import { 
  LayoutDashboard, 
  Library, 
  BookOpen, 
  BookmarkCheck, 
  ReceiptText, 
  Settings, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import { cn } from "../lib/utils";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Library Catalog", icon: Library, path: "/catalog" },
  { name: "My Borrowings", icon: BookOpen, path: "/borrowings" },
  { name: "Reservations", icon: BookmarkCheck, path: "/reservations" },
  { name: "Transactions", icon: ReceiptText, path: "/transactions" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-100 dark:bg-slate-950 flex flex-col py-8 px-4 gap-2 z-40 hidden md:flex">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-black text-indigo-950 dark:text-indigo-100 tracking-tighter">Ilm Gah</h1>
        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1">The Scholarly Atelier</p>
      </div>
      
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/admin");
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-white dark:bg-indigo-900/40 text-indigo-900 dark:text-amber-400 font-bold shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:translate-x-1"
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/50 pt-4">
        <Link to="/help" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-3 px-4 py-3 hover:translate-x-1 transition-transform duration-200">
          <HelpCircle size={20} />
          <span>Help Center</span>
        </Link>
        <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-3 px-4 py-3 hover:translate-x-1 transition-transform duration-200">
          <LogOut size={20} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
