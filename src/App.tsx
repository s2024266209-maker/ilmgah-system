/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Library, 
  BookOpen, 
  BookmarkCheck, 
  ReceiptText, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Search, 
  Bell, 
  Menu, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  Plus, 
  Download, 
  Filter, 
  CheckCircle2, 
  Archive, 
  History, 
  Clock, 
  Wallet, 
  Star, 
  Calendar, 
  ArrowRight, 
  ChevronRight,
  Smartphone,
  Brain,
  Globe,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./lib/utils";
import LandingPage from "./screens/LandingPage";
import LoginPage from "./screens/LoginPage";
import AdminDashboard from "./screens/AdminDashboard";
import ScholarDashboard from "./screens/ScholarDashboard";
import Catalog from "./screens/Catalog";
import BookManagement from "./screens/BookManagement";
import UserManagement from "./screens/UserManagement";
import Transactions from "./screens/Transactions";

import { FirebaseProvider, useAuth } from "./components/FirebaseProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function AppRoutes() {
  const { user, loading, isAuthReady } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUserRole(null);
      }
      setRoleLoading(false);
    };

    if (isAuthReady) {
      fetchRole();
    }
  }, [user, isAuthReady]);

  if (loading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
      
      {/* Admin Portal */}
      <Route 
        path="/admin" 
        element={userRole === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/admin/books" 
        element={userRole === "admin" ? <BookManagement /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/admin/users" 
        element={userRole === "admin" ? <UserManagement /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/admin/transactions" 
        element={userRole === "admin" ? <Transactions /> : <Navigate to="/login" />} 
      />
      
      {/* Student Portal */}
      <Route 
        path="/scholar" 
        element={userRole === "student" ? <ScholarDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/catalog" 
        element={userRole === "student" ? <Catalog /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/borrowings" 
        element={userRole === "student" ? <ScholarDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/reservations" 
        element={userRole === "student" ? <ScholarDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/profile" 
        element={userRole === "student" ? <ScholarDashboard /> : <Navigate to="/login" />} 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <Router>
          <AppRoutes />
        </Router>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
