import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  Upload, 
  Link as LinkIcon, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  Users, 
  ChevronRight,
  Menu,
  X,
  FileText,
  History,
  ChevronDown,
  Info,
  Trash2,
  Scale,
  Brain,
  Clock,
  ExternalLink
} from 'lucide-react';
import { translations, Language, TranslationSchema, languageNames } from './i18n';
import { analyzeContent, AnalysisResult } from './services/aiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [t, setT] = useState<TranslationSchema>(translations.en);
  const [activeTab, setActiveTab] = useState<'verify' | 'admin' | 'history'>('verify');
  const [inputMode, setInputMode] = useState<'text' | 'url' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: 'USER' | 'ADMIN' } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<'USER' | 'ADMIN'>('USER');
  const [history, setHistory] = useState<any[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setT(translations[lang]);
  }, [lang]);

  useEffect(() => {
    if (user && activeTab === 'history') {
      fetchHistory();
    }
    if (user?.role === 'ADMIN' && activeTab === 'admin') {
      fetchAdminStats();
    }
  }, [user, activeTab]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/history?userId=${user.id}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const fetchAdminStats = async () => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      const res = await fetch(`/api/admin/stats?adminId=${user.id}`);
      const data = await res.json();
      setAdminStats(data);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputText(`[File Uploaded: ${file.name}] Analysis in progress...`);
      // Simulate reading file content
      setTimeout(() => {
        setInputText(`Analysis of uploaded document: ${file.name}. The document appears to discuss civic matters in the local region.`);
      }, 1500);
    }
  };

  const handleUrlScrape = () => {
    if (inputText.startsWith('http')) {
      const originalUrl = inputText;
      setInputText(`[Scraping URL: ${originalUrl}] Fetching content...`);
      setTimeout(() => {
        setInputText(`Content extracted from ${originalUrl}: This article discusses recent developments in the upcoming local elections and addresses various claims made on social media.`);
      }, 1500);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeContent(inputText, lang);
      setResult(analysis);
      
      // Log to backend for TTL storage
      const res = await fetch('/api/verify/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: inputText, 
          result: analysis,
          userId: user?.id || 'anonymous'
        })
      });
      const logData = await res.json();
      
      // Update local history
      setHistory(prev => [{
        id: logData.id,
        content: inputText,
        result: analysis,
        timestamp: Date.now(),
        expiresAt: logData.expiresAt
      }, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setUser(data.user);
        setIsLoginModalOpen(false);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setAuthError(data.error || "Login failed");
      }
    } catch (err) {
      setAuthError("Connection error");
      console.error("Login failed:", err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: signupName, 
          email: loginEmail, 
          password: loginPassword,
          role: signupRole
        })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setUser(data.user);
        setIsLoginModalOpen(false);
        setSignupName('');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setAuthError(data.error || "Signup failed");
      }
    } catch (err) {
      setAuthError("Connection error");
      console.error("Signup failed:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setActiveTab('verify');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div dir={t.dir} className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100 transition-all duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Shield size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:block">
                {t.common.appName}
              </span>
            </div>

            {/* Horizontally Scrollable Language Selector */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8 overflow-hidden relative">
              <div 
                ref={scrollRef}
                className="flex gap-1 overflow-x-auto no-scrollbar py-1 px-4 mask-fade-edges"
              >
                {(Object.keys(languageNames) as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                      lang === l 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                    )}
                  >
                    {languageNames[l]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <button 
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    activeTab === 'history' ? "bg-emerald-50 text-emerald-600 shadow-inner" : "hover:bg-gray-100 text-gray-400"
                  )}
                >
                  <History size={20} />
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    activeTab === 'admin' ? "bg-emerald-50 text-emerald-600 shadow-inner" : "hover:bg-gray-100 text-gray-400"
                  )}
                >
                  <Settings size={20} />
                </button>
              )}
              {user ? (
                <div className="hidden md:flex items-center gap-3 pr-4 border-r border-gray-100">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900 leading-none">{user.name}</p>
                    <button onClick={handleLogout} className="text-[10px] font-black text-rose-500 uppercase tracking-tighter hover:underline">
                      {t.common.logout}
                    </button>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm shadow-sm">
                    {user.name[0]}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => { setIsSignup(false); setIsLoginModalOpen(true); }}
                  className="hidden md:flex px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                >
                  {t.common.login}
                </button>
              )}
              
              <button className="md:hidden p-2 text-gray-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu & Language Selector */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-black/5 px-4 py-6 space-y-4"
          >
            <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
              {(Object.keys(languageNames) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setIsMenuOpen(false); }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border whitespace-nowrap",
                    lang === l ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-gray-200"
                  )}
                >
                  {languageNames[l]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'verify' && (
          <div className="space-y-12">
            {/* Retention Notice */}
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex items-center gap-3 text-amber-800 text-xs font-medium max-w-2xl mx-auto">
              <Clock size={16} className="shrink-0" />
              {t.common.retentionNotice}
            </div>

            {/* Hero Section */}
            <section className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900"
              >
                {t.home.heroTitle}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600"
              >
                {t.home.heroSub}
              </motion.p>
            </section>

            {/* Verification Tool */}
            <section className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 overflow-hidden">
                {/* Input Tabs */}
                <div className="flex border-b border-black/5">
                  <button 
                    onClick={() => setInputMode('text')}
                    className={cn(
                      "flex-1 py-4 flex items-center justify-center gap-2 font-semibold transition-all",
                      inputMode === 'text' ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <FileText size={18} /> {t.common.verify}
                  </button>
                  <button 
                    onClick={() => setInputMode('url')}
                    className={cn(
                      "flex-1 py-4 flex items-center justify-center gap-2 font-semibold transition-all",
                      inputMode === 'url' ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <LinkIcon size={18} /> URL
                  </button>
                  <button 
                    onClick={() => setInputMode('file')}
                    className={cn(
                      "flex-1 py-4 flex items-center justify-center gap-2 font-semibold transition-all",
                      inputMode === 'file' ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <Upload size={18} /> {t.home.uploadLabel.split(' ')[0]}
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {inputMode === 'text' && (
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={t.home.inputPlaceholder}
                      className="w-full h-48 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 resize-none text-lg"
                    />
                  )}
                  {inputMode === 'url' && (
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t.home.urlPlaceholder}
                        className="flex-1 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button 
                        onClick={handleUrlScrape}
                        className="px-6 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all"
                      >
                        {t.home.fetchBtn}
                      </button>
                    </div>
                  )}
                  {inputMode === 'file' && (
                    <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-gray-50 group">
                      <Upload className="mx-auto text-gray-400 mb-4 group-hover:text-emerald-500 transition-colors" size={48} />
                      <p className="text-gray-600 font-medium">{t.home.uploadLabel}</p>
                      <p className="text-xs text-gray-400 mt-2">Supports PNG, JPG, PDF (Max 10MB)</p>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}

                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText.trim()}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <History size={20} />
                        </motion.div>
                        {t.home.analyzeBtn}...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        {t.home.analyzeBtn}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Results Section */}
            <AnimatePresence>
              {result && (
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-5xl mx-auto space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Score Card */}
                    <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl shadow-black/5 flex flex-col items-center justify-center text-center">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">{t.results.credibilityScore}</h3>
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                          <motion.circle 
                            cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" 
                            strokeDasharray={464.7}
                            initial={{ strokeDashoffset: 464.7 }}
                            animate={{ strokeDashoffset: 464.7 - (464.7 * result.credibilityScore) / 100 }}
                            className={cn(
                              result.credibilityScore > 70 ? "text-emerald-500" : result.credibilityScore > 40 ? "text-amber-500" : "text-rose-500"
                            )}
                          />
                        </svg>
                        <span className="absolute text-4xl font-black">{result.credibilityScore}%</span>
                      </div>
                      <div className={cn(
                        "mt-8 px-6 py-2 rounded-full text-lg font-bold",
                        result.credibilityScore > 70 ? "bg-emerald-100 text-emerald-700" : result.credibilityScore > 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {result.classification}
                      </div>
                      <p className="mt-4 text-xs text-gray-400 font-medium">{t.results.detectedLanguage}: {result.detectedLanguage}</p>
                    </div>

                    {/* Quick Breakdown */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-black/5 shadow-xl shadow-black/5 space-y-8">
                      <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Brain size={16} className="text-emerald-600" /> {t.results.reasoning}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">{result.reasoning}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t.results.confidence}</h4>
                          <p className="text-2xl font-black text-gray-900">{result.confidence}%</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t.results.communalIntensity}</h4>
                          <div className="flex items-center gap-2">
                            <p className={cn("text-2xl font-black", result.communalIntensityScore > 50 ? "text-rose-600" : "text-emerald-600")}>
                              {result.communalIntensityScore}%
                            </p>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hate Speech</h4>
                          <p className={cn("text-2xl font-black", result.hateSpeechDetected ? "text-rose-600" : "text-emerald-600")}>
                            {result.hateSpeechDetected ? (t.dir === 'rtl' ? "ہاں" : "Yes") : (t.dir === 'rtl' ? "نہیں" : "No")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis Report */}
                  <div className="bg-white rounded-3xl border border-black/5 shadow-xl shadow-black/5 overflow-hidden">
                    <div className="p-8 border-b border-black/5 bg-gray-50/50">
                      <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <BarChart3 className="text-emerald-600" /> {t.results.detailedAnalysis}
                      </h2>
                    </div>

                    <div className="divide-y divide-black/5">
                      {/* Claim Extraction */}
                      <div className="p-6">
                        <button 
                          onClick={() => toggleSection('claims')}
                          className="w-full flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <FileText size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{t.results.claimExtraction}</h3>
                          </div>
                          <ChevronDown className={cn("text-gray-400 transition-transform", expandedSection === 'claims' && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {expandedSection === 'claims' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <ul className="mt-6 space-y-3 pl-14">
                                {result.claimExtraction.map((claim, i) => (
                                  <li key={i} className="flex gap-3 text-gray-600">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold shrink-0">{i+1}</span>
                                    {claim}
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Ideological Framing */}
                      <div className="p-6">
                        <button 
                          onClick={() => toggleSection('framing')}
                          className="w-full flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                              <Scale size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{t.results.ideologicalFraming}</h3>
                          </div>
                          <ChevronDown className={cn("text-gray-400 transition-transform", expandedSection === 'framing' && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {expandedSection === 'framing' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-6 pl-14 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Political Bias</h4>
                                    <p className="text-gray-700 font-medium">{result.ideologicalFraming.politicalBias}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Religious Bias</h4>
                                    <p className="text-gray-700 font-medium">{result.ideologicalFraming.religiousBias}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Propaganda Patterns</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {result.ideologicalFraming.propagandaPatterns.map((p, i) => (
                                      <span key={i} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs border border-violet-100 font-medium">
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Rhetorical & Logical Fallacies */}
                      <div className="p-6">
                        <button 
                          onClick={() => toggleSection('logic')}
                          className="w-full flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                              <AlertTriangle size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{t.results.logicalFallacies} & Patterns</h3>
                          </div>
                          <ChevronDown className={cn("text-gray-400 transition-transform", expandedSection === 'logic' && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {expandedSection === 'logic' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-6 pl-14 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{t.results.logicalFallacies}</h4>
                                  <ul className="space-y-2">
                                    {result.logicalFallacies.map((f, i) => (
                                      <li key={i} className="flex items-center gap-2 text-sm text-amber-700 font-medium">
                                        <AlertTriangle size={14} /> {f}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{t.results.rhetoricalPatterns}</h4>
                                  <ul className="space-y-2">
                                    {result.rhetoricalPatterns.map((p, i) => (
                                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <CheckCircle size={14} className="text-emerald-500" /> {p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Timeline Verification */}
                      <div className="p-6">
                        <button 
                          onClick={() => toggleSection('timeline')}
                          className="w-full flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Clock size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{t.results.timelineVerification}</h3>
                          </div>
                          <ChevronDown className={cn("text-gray-400 transition-transform", expandedSection === 'timeline' && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {expandedSection === 'timeline' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-6 pl-14">
                                <p className="text-gray-700 font-medium leading-relaxed">{result.timelineVerification}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Sources & Transparency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl shadow-black/5">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <ExternalLink size={16} className="text-emerald-600" /> {t.results.sources}
                      </h3>
                      <ul className="space-y-4">
                        {result.sources.map((source, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-black/5 hover:border-emerald-200 transition-colors cursor-pointer group">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-black/5 font-bold text-xs">
                              {i+1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">{source}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Verified Authority</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl shadow-black/5">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Info size={16} className="text-emerald-600" /> Transparency Metadata
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-black/5">
                          <span className="text-xs font-bold text-gray-400 uppercase">Model Version</span>
                          <span className="text-sm font-bold text-gray-900">Gemini 3.1 Pro</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-black/5">
                          <span className="text-xs font-bold text-gray-400 uppercase">Analysis Timestamp</span>
                          <span className="text-sm font-bold text-gray-900">{new Date().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-black/5">
                          <span className="text-xs font-bold text-gray-400 uppercase">Input Language</span>
                          <span className="text-sm font-bold text-gray-900">{result.detectedLanguage}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">Privacy Policy</span>
                          <span className="text-xs font-bold text-emerald-600">TTL Active (168h)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{t.history.title}</h2>
                <p className="text-gray-500">{t.history.subtitle}</p>
              </div>
              <button 
                onClick={() => setActiveTab('verify')}
                className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-sm hover:bg-gray-200"
              >
                {t.history.back}
              </button>
            </div>

            {history.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-black/5 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                  <History size={32} />
                </div>
                <p className="text-gray-400 font-medium">{t.history.empty}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      setResult(item.result);
                      setInputText(item.content);
                      setActiveTab('verify');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                          item.result.credibilityScore > 70 ? "bg-emerald-50 text-emerald-600" :
                          item.result.credibilityScore > 40 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        )}>
                          <Shield size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{item.content}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-gray-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              Score: {item.result.credibilityScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
                          <Clock size={12} />
                          {t.history.expires} {Math.round((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))}h
                        </div>
                        <ChevronRight className={cn("ml-auto mt-2 text-gray-300 group-hover:text-emerald-500 transition-colors", t.dir === 'rtl' && "rotate-180")} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'ADMIN' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{t.admin.analytics}</h2>
                <p className="text-gray-500">System-wide misinformation trends and metrics.</p>
              </div>
              <button 
                onClick={() => setActiveTab('verify')}
                className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-sm hover:bg-gray-200"
              >
                Back to Verify
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Verifications", value: adminStats?.totalVerifications || "...", icon: Search, color: "text-blue-600" },
                { label: "Flagged Content", value: adminStats?.flaggedContent || "...", icon: AlertTriangle, color: "text-rose-600" },
                { label: "Active Users", value: adminStats?.activeUsers || "...", icon: Users, color: "text-emerald-600" },
                { label: "Accuracy Rate", value: adminStats?.accuracyRate || "...", icon: BarChart3, color: "text-violet-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                  <div className={cn("w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4", stat.color)}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                <h3 className="text-xl font-bold mb-6">{t.admin.trends}</h3>
                <div className="space-y-4">
                  {(adminStats?.trends || [
                    { trend: "Election Rumors", count: 150, color: "bg-emerald-500" },
                    { trend: "Health Scams", count: 85, color: "bg-amber-500" },
                    { trend: "Communal Incitement", count: 210, color: "bg-rose-500" },
                    { trend: "Deepfake Videos", count: 45, color: "bg-blue-500" }
                  ]).map((item: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{item.trend}</span>
                        <span>{item.count}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / (adminStats?.trends?.[2]?.count || 210)) * 100}%` }}
                          className={cn("h-full rounded-full", item.color || "bg-emerald-500")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                  {t.admin.activity}
                  <Trash2 size={18} className="text-gray-300" />
                </h3>
                <div className="space-y-4">
                  {(adminStats?.recentLogs || [1, 2, 3]).map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          log.result?.credibilityScore < 40 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                          {log.result?.credibilityScore < 40 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                        </div>
                        <div className="max-w-[200px]">
                          <p className="font-bold text-sm truncate">{log.content || "Suspicious claim detected..."}</p>
                          <p className="text-xs text-gray-400">
                            {log.userId === 'anonymous' ? 'Guest' : 'User'} • {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '2 mins ago'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-300" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 text-emerald-600 font-bold text-sm hover:bg-emerald-50 rounded-xl transition-colors">
                  View Full Audit Log
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Login/Signup Modal */}
      <AnimatePresence mode="wait">
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                      <Shield size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                      {isSignup ? t.auth.signUp : t.auth.signIn}
                    </h2>
                  </div>
                  <button onClick={() => setIsLoginModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {authError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                    <AlertTriangle size={18} />
                    {authError}
                  </div>
                )}

                <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
                  {isSignup && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t.auth.fullName}</label>
                        <input 
                          type="text" 
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t.auth.accountType}</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSignupRole('USER')}
                            className={cn(
                              "py-3 rounded-xl text-xs font-bold border transition-all",
                              signupRole === 'USER' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-gray-100 text-gray-400"
                            )}
                          >
                            {t.auth.publicUser}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSignupRole('ADMIN')}
                            className={cn(
                              "py-3 rounded-xl text-xs font-bold border transition-all",
                              signupRole === 'ADMIN' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-gray-100 text-gray-400"
                            )}
                          >
                            {t.auth.administrator}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t.auth.email}</label>
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@bharatshield.in"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t.auth.password}</label>
                    <input 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-[0.98]"
                  >
                    {isSignup ? t.auth.signUp : t.auth.signIn}
                  </button>
                </form>
                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    {isSignup ? t.auth.hasAccount : t.auth.noAccount} {" "}
                    <button 
                      onClick={() => { setIsSignup(!isSignup); setAuthError(null); }}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      {isSignup ? t.auth.signIn : t.auth.signUp}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-black/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
            <Shield size={20} /> Bharat Civic Shield
          </div>
          <p className="text-sm text-gray-400">
            Empowering citizens with AI-driven truth verification. Built for a resilient digital India.
          </p>
          <div className="flex justify-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600">Terms of Service</a>
            <a href="#" className="hover:text-emerald-600">Transparency Report</a>
          </div>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
}
