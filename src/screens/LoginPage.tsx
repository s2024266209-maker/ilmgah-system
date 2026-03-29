import React, { useState } from "react";
import { ArrowRight, Mail, Lock, ShieldCheck, Github, Chrome, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface LoginPageProps {
  onLogin: (role: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // If it doesn't exist, we might be in a state where the user was created in Auth but not Firestore
        // For the default admin, we should ensure it's created
        if (email === "mehmoodrehan708@gmail.com") {
          await setDoc(doc(db, "users", user.uid), {
            name: "Default Admin",
            email: user.email,
            role: "admin",
            status: "active",
            createdAt: serverTimestamp()
          });
          onLogin("admin");
          navigate("/admin");
        } else {
          setError("User profile not found. Please contact your librarian.");
          await auth.signOut();
        }
      } else {
        const userData = userDoc.data();
        onLogin(userData.role);
        if (userData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/scholar");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please try again.");
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerType: 'google' | 'github') => {
    setError("");
    setIsLoading(true);
    const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check/Create user document
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Default new social logins to student role
        // UNLESS it's the specific admin email
        const isDefaultAdmin = user.email === "mehmoodrehan708@gmail.com";
        const newRole = isDefaultAdmin ? "admin" : "student";
        
        await setDoc(userDocRef, {
          name: user.displayName || "New Scholar",
          email: user.email,
          role: newRole,
          status: "active",
          createdAt: serverTimestamp()
        });
        
        onLogin(newRole);
        navigate(newRole === "admin" ? "/admin" : "/scholar");
      } else {
        const userData = userDoc.data();
        onLogin(userData.role);
        navigate(userData.role === "admin" ? "/admin" : "/scholar");
      }
    } catch (err: any) {
      console.error("Social login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in window was closed before completion. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setError("Failed to sign in with " + providerType + ". Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans antialiased">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden">
        {/* Left Side: Branding & Info */}
        <div className="bg-indigo-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="z-10">
            <Link to="/" className="text-2xl font-black tracking-tighter mb-12 block">ILMGAH</Link>
            <h2 className="text-4xl font-bold mb-6 leading-tight">Access the Scholarly Atelier.</h2>
            <p className="text-indigo-200 text-lg mb-12 max-w-sm">Access your institutional archives, research materials, and scholarly tools in one unified digital space.</p>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, text: "Secure Institutional Access" },
                { icon: Mail, text: "Automated Notifications" },
                { icon: Lock, text: "End-to-End Encryption" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="z-10 mt-12 flex items-center gap-4 text-sm text-indigo-300">
            <span>© 2024 ILMGAH</span>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <span>v2.0-stable</span>
          </div>

          {/* Abstract Shapes */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 md:p-20 flex flex-col justify-center">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h3>
            <p className="text-slate-500">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                type="button"
                onClick={() => { setRole("student"); setError(""); }}
                className={cn(
                  "py-3 rounded-xl font-bold text-sm transition-all",
                  role === "student" ? "bg-indigo-900 text-white shadow-lg" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                Student Portal
              </button>
              <button 
                type="button"
                onClick={() => { setRole("admin"); setError(""); }}
                className={cn(
                  "py-3 rounded-xl font-bold text-sm transition-all",
                  role === "admin" ? "bg-indigo-900 text-white shadow-lg" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                Admin Portal
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-medium"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@ilmgah.edu" : "scholar@ilmgah.edu"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500" htmlFor="password">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-900 text-white py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : `Sign In to ${role === "admin" ? "Admin" : "Scholar"} Portal`}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="my-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 disabled:opacity-50"
            >
              <Chrome size={18} />
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-slate-700 disabled:opacity-50"
            >
              <Github size={18} />
              GitHub
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/" className="text-indigo-600 font-bold hover:underline">Contact your Librarian</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
