import React from "react";
import { ArrowRight, BookOpen, Smartphone, Brain, Search, Share2, Globe, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-indigo-900 tracking-tighter">ILMGAH</span>
            <div className="hidden md:flex gap-6 items-center text-sm font-semibold text-slate-600">
              <Link className="hover:text-indigo-600 transition-colors" to="/">Home</Link>
              <Link className="hover:text-indigo-600 transition-colors" to="/catalog">Catalog</Link>
              <Link className="hover:text-indigo-600 transition-colors" to="/about">About</Link>
              <Link className="hover:text-indigo-600 transition-colors" to="/contact">Contact</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-indigo-900 hover:text-indigo-700 transition-colors">Sign In</Link>
            <Link to="/login" className="bg-indigo-900 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-800 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative px-6 pt-24 pb-32 md:pt-32 md:pb-48 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block py-1 px-3 mb-6 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold uppercase tracking-widest">Version 2.0 Professional Edition</span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">
                The Future of <span className="text-indigo-600 italic">Library</span> Management.
              </h1>
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                Digitize your scholarly collection with ILMGAH. A comprehensive, modern, and scalable solution for educational institutions worldwide.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="bg-indigo-900 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                  Launch Portal
                  <ArrowRight size={18} />
                </Link>
                <button className="bg-white text-indigo-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
                  Request Demo
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="bg-white p-4 rounded-3xl shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  alt="Library Indoor Environment" 
                  className="rounded-2xl shadow-inner w-full h-auto" 
                  src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=2000"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Floating Stats */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl hidden md:block max-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen size={20} className="text-amber-600" />
                  </div>
                  <span className="font-bold text-sm">Active Loans</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-3/4"></div>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-2 block">System Optimization: 98%</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-slate-100 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Enterprise-Grade Features</h2>
              <p className="text-slate-600 italic">Built for scale, designed for simplicity. ILMGAH provides all the tools you need to manage a modern library.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Brain, title: "AI Curation", desc: "Personalized book recommendations powered by machine learning algorithms." },
                { icon: Smartphone, title: "Mobile Ready", desc: "Access library services on any device with our fully responsive interface." },
                { icon: Search, title: "Advanced Search", desc: "Multi-field search with real-time suggestions and availability status." },
                { icon: Globe, title: "24/7 Access", desc: "Round-the-clock access to digital library services and reservations." },
                { icon: Bell, title: "Smart Alerts", desc: "Automatic notifications for due dates, availability, and fine status." },
                { icon: Share2, title: "Analytics", desc: "Comprehensive reporting and insights for administrative decision making." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-6 bg-indigo-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
            {[
              { label: "Total Users", value: "12k+" },
              { label: "Books Cataloged", value: "45k+" },
              { label: "Daily Transactions", value: "850+" },
              { label: "Accuracy Rate", value: "99.9%" }
            ].map((stat, i) => (
              <div key={i}>
                <h4 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">{stat.value}</h4>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-32">
          <div className="max-w-4xl mx-auto bg-indigo-50 rounded-[3rem] p-12 md:p-24 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-indigo-950 mb-8 tracking-tight">Ready to Modernize Your Library?</h2>
            <p className="text-indigo-700/70 text-lg mb-12 max-w-xl mx-auto">Join hundreds of institutions already using ILMGAH to streamline their operations.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login" className="bg-indigo-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">
                Get Started Now
              </Link>
              <button className="bg-white text-indigo-900 px-10 py-4 rounded-2xl font-bold border border-indigo-200 hover:bg-indigo-50 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-black text-indigo-900 tracking-tighter">ILMGAH</span>
            <p className="text-slate-500 text-xs uppercase tracking-widest">© 2024 ILMGAH Library Management System. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
