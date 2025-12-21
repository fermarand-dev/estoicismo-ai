import React, { useState, useEffect } from 'react';
import { AppView, UserState, StoicMessage, JournalEntry } from './types';
import { generateStoicMessage } from './geminiService';
import { supabase } from './supabaseClient';
import { 
  Home, BookOpen, Crown, History, Loader2, Plus, ArrowRight, 
  CheckCircle2, LogOut, Mail, Lock, User, Sparkles, 
  Copy, Star, Share, Download, X, AlertTriangle, LogIn, RefreshCw 
} from 'lucide-react';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZu3cudzo8EmdDZ0uz9k400'; 

// --- Componentes Auxiliares ---

const InstallPrompt: React.FC = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    const handler = (e: any) => { e.preventDefault(); setShow(true); };
    window.addEventListener('beforeinstallprompt', handler);
    if (ios) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-6 right-6 z-[100] animate-fade">
      <div className="bg-white text-black p-6 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-gray-400 p-1"><X size={18} /></button>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg text-black">
            <Download size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Instalar Aplicativo</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Acesso instantâneo</p>
          </div>
        </div>
        {isIOS ? (
          <p className="text-xs font-medium text-gray-700 leading-relaxed">
            Toque em <Share size={14} className="inline text-blue-500 mx-1"/> e depois selecione <br/>
            <span className="font-bold">"Adicionar à Tela de Início"</span>.
          </p>
        ) : (
          <button className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-transform">
            Instalar Agora
          </button>
        )}
      </div>
    </div>
  );
};

const Navigation: React.FC<{ current: AppView; setView: (v: AppView) => void }> = ({ current, setView }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-[#0f1115]/95 backdrop-blur-xl border-t border-white/5 px-6 py-5 flex justify-around items-center z-50">
    {[
      { id: 'today', icon: Home, label: 'Hoje' },
      { id: 'history', icon: History, label: 'Arquivo' },
      { id: 'journal', icon: BookOpen, label: 'Diário' },
      { id: 'premium', icon: Crown, label: 'Premium' },
    ].map((item) => (
      <button 
        key={item.id} 
        onClick={() => setView(item.id as AppView)} 
        className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${current === item.id ? 'text-amber-500 scale-110' : 'text-gray-500 opacity-60 hover:opacity-100'}`}
      >
        <item.icon size={22} strokeWidth={current === item.id ? 2.5 : 2} />
        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
        {current === item.id && <div className="absolute -bottom-2 w-1 h-1 bg-amber-500 rounded-full" />}
      </button>
    ))}
  </nav>
);

const StoicCard: React.FC<{ message: StoicMessage; isPremium?: boolean }> = ({ message, isPremium }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = `${message.title}\n\n"${message.message}"\n\nReflexão: ${message.reflection}\n\n— via Estoicismo AI`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade pb-8">
      <div className="relative">
        {isPremium && (
          <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Star size={10} fill="currentColor"/> Lição de Ouro
          </div>
        )}
        <div className="flex justify-between items-start gap-4 mb-6">
          <h2 className="text-4xl font-serif font-bold text-white leading-tight pr-4">{message.title}</h2>
          <button onClick={handleCopy} className={`p-3.5 rounded-2xl transition-all active:scale-90 ${copied ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
          </button>
        </div>
        <div className="h-1 w-16 bg-amber-500 rounded-full mb-8 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        <p className="text-2xl text-gray-200/90 leading-relaxed font-serif italic">"{message.message}"</p>
      </div>
      <div className="grid gap-6">
        <section className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-amber-500/60 uppercase tracking-[0.2em] text-[10px] font-black mb-4 flex items-center gap-2"><Sparkles size={12} /> Contemplação</h3>
          <p className="text-gray-300 text-lg leading-relaxed font-serif">{message.reflection}</p>
        </section>
        <section className="bg-amber-500/[0.03] p-8 rounded-[2rem] border border-amber-500/10">
          <h3 className="text-amber-500 uppercase tracking-[0.2em] text-[10px] font-black mb-4 flex items-center gap-2"><CheckCircle2 size={12} /> Prática de Hoje</h3>
          <p className="text-white text-lg font-bold leading-relaxed">{message.exercise}</p>
        </section>
      </div>
    </div>
  );
};

// --- Telas Principais ---

const HistoryView: React.FC<{ history: StoicMessage[]; isPremium: boolean }> = ({ history, isPremium }) => (
  <div className="space-y-12 animate-fade">
    <div className="flex flex-col gap-2">
      <h2 className="text-3xl font-serif font-bold text-white">Arquivo Sagrado</h2>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Suas lições passadas</p>
    </div>
    {history.length === 0 ? (
      <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] text-gray-600 font-serif italic flex flex-col items-center gap-4">
        <History size={48} className="opacity-20" />
        Seu arquivo está vazio. Comece a praticar hoje.
      </div>
    ) : (
      <div className="space-y-16">
        {history.map((msg) => (
          <div key={msg.id} className="relative pl-8 border-l border-white/10">
            <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <StoicCard message={msg} isPremium={isPremium} />
          </div>
        ))}
      </div>
    )}
  </div>
);

const JournalView: React.FC<{ entries: JournalEntry[]; onAdd: (c: string) => void }> = ({ entries, onAdd }) => {
  const [text, setText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-12 animate-fade">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-serif font-bold text-white">Exame Diário</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Autoexame de consciência</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className={`p-4 rounded-2xl shadow-xl active:scale-90 transition-all ${isAdding ? 'bg-red-500/10 text-red-500' : 'bg-white text-black'}`}>
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>
      {isAdding && (
        <form onSubmit={submit} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6 animate-fade">
          <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="O que realizei hoje que foi virtuoso? Onde falhei?" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white font-serif text-lg italic focus:outline-none min-h-[180px] resize-none" />
          <button type="submit" className="w-full bg-white text-black py-4.5 rounded-xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform shadow-lg">Salvar Reflexão</button>
        </form>
      )}
      <div className="grid gap-6">
        {entries.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] text-gray-600 font-serif italic flex flex-col items-center gap-4">
            <BookOpen size={48} className="opacity-20" />
            Nenhuma reflexão anotada ainda.
          </div>
        ) : entries.map(entry => (
          <div key={entry.id} className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 space-y-4">
            <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <p className="text-gray-200 font-serif text-lg italic leading-relaxed">"{entry.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PremiumView: React.FC<{ isPremium: boolean }> = ({ isPremium }) => (
  <div className="space-y-12 animate-fade pb-10">
    <div className="text-center space-y-6 pt-6">
      <div className="inline-flex p-7 rounded-3xl bg-amber-500/10 text-amber-500 shadow-2xl mb-2 relative">
        <Crown size={64} strokeWidth={1.5} />
        <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1.5 rounded-full"><Sparkles size={16} /></div>
      </div>
      <h2 className="text-4xl font-serif font-bold text-white">Elite Estoica</h2>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] opacity-80">Acesso Pleno à Virtude</p>
    </div>
    {isPremium ? (
      <div className="bg-amber-500/10 border border-amber-500/20 p-12 rounded-[3.5rem] text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto text-black shadow-lg"><CheckCircle2 size={32} /></div>
        <h3 className="text-2xl font-serif font-bold text-white">Sua Conta é Elite</h3>
        <p className="text-gray-400 text-sm">Aproveite todas as lições ilimitadas.</p>
      </div>
    ) : (
      <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 space-y-10">
        <ul className="space-y-6">
          {['Lições diárias ilimitadas', 'Acesso total ao Arquivo', 'Diário sem limites', 'Processamento IA Pro'].map((f, i) => (
            <li key={i} className="flex items-center gap-4 text-[13px] font-bold text-gray-300">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0"><CheckCircle2 size={12} /></div>
              {f}
            </li>
          ))}
        </ul>
        <div className="pt-4 space-y-6 text-center">
          <div>
            <span className="text-5xl font-black text-white tracking-tighter">R$ 9,90</span>
            <span className="text-gray-500 text-[11px] font-black uppercase tracking-widest ml-3">Pagamento Único</span>
          </div>
          <button onClick={() => window.open(STRIPE_PAYMENT_LINK, '_blank')} className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] active:scale-95 transition-all hover:bg-amber-500 shadow-xl">ADQUIRIR AGORA</button>
        </div>
      </div>
    )}
  </div>
);

// --- Componente Raiz (App) ---

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('today');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userState, setUserState] = useState<UserState>({ authUser: null, isPremium: false, messageCount: 0, history: [], journal: [] });
  const [showConfigModal, setShowConfigModal] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      const { data: history } = await supabase.from('history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const { data: journal } = await supabase.from('journal').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setUserState(prev => ({
        ...prev,
        isPremium: profile?.is_premium || false,
        messageCount: profile?.total_messages_generated || 0,
        history: history?.map(h => h.content) || [],
        journal: journal?.map(j => ({ id: j.id, date: j.created_at, content: j.content, title: 'Reflexão' })) || []
      }));
    } catch (err) { console.error("Erro ao carregar perfil", err); }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserState(prev => ({ ...prev, authUser: { email: session.user.email!, uid: session.user.id, name: session.user.user_metadata?.full_name } }));
        fetchProfile(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserState(prev => ({ ...prev, authUser: { email: session.user.email!, uid: session.user.id, name: session.user.user_metadata?.full_name } }));
        fetchProfile(session.user.id);
      } else {
        setUserState({ authUser: null, isPremium: false, messageCount: 0, history: [], journal: [] });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("E-mail de confirmação enviado. Verifique sua caixa de entrada.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) { alert(err.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : err.message); } finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!userState.isPremium && userState.messageCount >= 1) { setView('premium'); return; }
    if (!userState.authUser) return;
    setLoading(true);
    try {
      const newMessage = await generateStoicMessage(userState.history);
      await supabase.from('history').insert({ user_id: userState.authUser.uid, content: newMessage });
      await supabase.rpc('increment_message_counter', { user_id: userState.authUser.uid });
      setUserState(prev => ({ ...prev, messageCount: prev.messageCount + 1, history: [newMessage, ...prev.history] }));
    } catch (err) { alert("A conexão com a sabedoria falhou. Verifique sua internet."); } finally { setLoading(false); }
  };

  const addJournalEntry = async (content: string) => {
    if (!userState.authUser) return;
    try {
      const { data, error } = await supabase.from('journal').insert({ user_id: userState.authUser.uid, content }).select().single();
      if (error) throw error;
      setUserState(prev => ({ ...prev, journal: [{ id: data.id, date: data.created_at, content: data.content, title: 'Reflexão' }, ...prev.journal] }));
    } catch (err) { alert("Não foi possível salvar sua reflexão."); }
  };

  // --- Tela de Autenticação (Login/Cadastro) ---
  if (!userState.authUser) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#0f1115]">
      <div className="w-full max-sm:px-4 max-w-sm space-y-10 animate-fade">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center font-serif text-black text-5xl font-black mx-auto shadow-2xl">E</div>
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-white">Estoicismo AI</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">A virtude como bússola</p>
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
          <div className="flex p-1 bg-black/40 rounded-2xl">
            <button onClick={() => setAuthMode('signin')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signin' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Entrar</button>
            <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>Cadastrar</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-5 top-5.5 text-gray-600" />
              <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:outline-none transition-all" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-5 top-5.5 text-gray-600" />
              <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:outline-none transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-colors flex items-center justify-center gap-3 active:scale-95 shadow-xl">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />} 
              {authMode === 'signin' ? 'Entrar Agora' : 'Criar Conta'}
            </button>
          </form>

          <div className="relative py-2 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Ou rápido com</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="w-full bg-white/5 text-white py-4.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 border border-white/10 active:scale-95 transition-all hover:bg-white/10">
            <Sparkles size={16} className="text-amber-500" /> Entrar com Google
          </button>
        </div>
      </div>
    </div>
  );

  // --- Estrutura Principal da App ---
  return (
    <div className="max-w-md mx-auto px-8 min-h-screen relative bg-[#0f1115] text-white custom-scrollbar pb-10">
      <header className="py-10 flex justify-between items-center border-b border-white/5 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center font-serif text-black text-3xl font-black shadow-lg">E</div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Estoicismo</h1>
            <span className="text-[9px] uppercase tracking-[0.4em] text-amber-500 font-black opacity-80">Discípulo</span>
          </div>
        </div>
        <button onClick={() => setShowConfigModal(true)} className="p-3.5 rounded-2xl bg-white/5 text-gray-500 hover:text-amber-500 transition-colors active:scale-90">
          <User size={22} />
        </button>
      </header>

      {showConfigModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowConfigModal(false)} />
          <div className="relative bg-[#1a1c23] border border-white/5 p-10 rounded-[3.5rem] text-center space-y-8 animate-fade w-full max-w-sm">
            <h3 className="text-xl font-bold text-white">Sua Conta</h3>
            <p className="text-gray-500 text-xs">{userState.authUser.email}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { supabase.auth.signOut(); setShowConfigModal(false); }} className="w-full bg-white/5 text-gray-300 py-4.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10">Sair da conta</button>
              <button onClick={() => setShowConfigModal(false)} className="w-full text-gray-600 py-2 text-[10px] font-black uppercase tracking-widest mt-2">Fechar</button>
            </div>
          </div>
        </div>
      )}

      <main className="pb-36">
        {view === 'today' && (
          <div className="space-y-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 gap-8">
                <Loader2 className="animate-spin text-amber-500" size={64} strokeWidth={1} />
                <p className="text-white font-serif text-2xl italic text-center px-10">"A virtude é o único bem."</p>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">Buscando sabedoria...</p>
              </div>
            ) : userState.history[0] ? (
              <div className="animate-fade">
                <StoicCard message={userState.history[0]} isPremium={userState.isPremium} />
                <button onClick={handleGenerate} className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mt-12 mx-auto flex items-center gap-2 hover:text-amber-500 transition-colors">
                  <RefreshCw size={12} /> Próxima Lição
                </button>
              </div>
            ) : (
              <div className="text-center py-24 space-y-10 animate-fade">
                <div className="relative inline-block">
                  <Sparkles size={100} className="text-amber-500 opacity-20 mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ArrowRight size={40} className="text-amber-500 animate-bounce-x" />
                  </div>
                </div>
                <h3 className="text-4xl font-serif font-bold text-white">Pronto para começar?</h3>
                <button onClick={handleGenerate} className="bg-white text-black px-14 py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl flex items-center gap-4 mx-auto hover:bg-amber-500 active:scale-95 transition-all">INICIAR PRÁTICA <ArrowRight size={18} /></button>
              </div>
            )}
          </div>
        )}
        {view === 'history' && <HistoryView history={userState.history} isPremium={userState.isPremium} />}
        {view === 'journal' && <JournalView entries={userState.journal} onAdd={addJournalEntry} />}
        {view === 'premium' && <PremiumView isPremium={userState.isPremium} />}
      </main>

      <InstallPrompt />
      <Navigation current={view} setView={setView} />
    </div>
  );
};

export default App;
