import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppView, UserState, StoicMessage, JournalEntry } from './types';
import { generateStoicMessage } from './geminiService';
import { supabase } from './supabaseClient';
import { Home, BookOpen, Crown, History, Loader2, Plus, ArrowRight, CheckCircle2, LogOut, Mail, Lock, ShieldCheck, User, Sparkles, RefreshCw, Copy, ChevronRight, Star, Share, Download, X, Trash2, AlertTriangle } from 'lucide-react';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZu3cudzo8EmdDZ0uz9k400'; 

// --- Componentes de UI de Suporte ---

const InstallPrompt: React.FC = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    
    const handler = (e: any) => {
      e.preventDefault();
      setShow(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    if (ios) setTimeout(() => setShow(true), 5000);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-6 right-6 z-[100] animate-fade">
      <div className="bg-white text-black p-6 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg text-black">
            <Download size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Instalar Aplicativo</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Acesso rápido e offline</p>
          </div>
        </div>
        {isIOS ? (
          <p className="text-xs font-medium text-gray-700">Toque em <Share size={14} className="inline text-blue-500"/> e "Adicionar à Tela de Início".</p>
        ) : (
          <button className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Instalar Agora</button>
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
        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${current === item.id ? 'text-amber-500 scale-110' : 'text-gray-500 opacity-60'}`}
      >
        <item.icon size={22} strokeWidth={current === item.id ? 2.5 : 2} />
        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
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
        {isPremium && <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Star size={10} fill="currentColor"/> Lição de Ouro</div>}
        <div className="flex justify-between items-start gap-4 mb-6">
          <h2 className="text-4xl font-serif font-bold text-white leading-tight">{message.title}</h2>
          <button onClick={handleCopy} className={`p-3 rounded-2xl transition-all ${copied ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-400'}`}>
            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
          </button>
        </div>
        <div className="h-1 w-16 bg-amber-500 rounded-full mb-8" />
        <p className="text-2xl text-gray-200/90 leading-relaxed font-serif italic selection:bg-amber-500/30">"{message.message}"</p>
      </div>
      
      <div className="grid gap-6">
        <section className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.05] transition-colors">
          <h3 className="text-amber-500/60 uppercase tracking-[0.2em] text-[10px] font-black mb-4">Contemplação</h3>
          <p className="text-gray-300 text-lg leading-relaxed font-serif">{message.reflection}</p>
        </section>
        
        <section className="bg-amber-500/[0.03] p-8 rounded-[2rem] border border-amber-500/10">
          <h3 className="text-amber-500 uppercase tracking-[0.2em] text-[10px] font-black mb-4">Prática de Hoje</h3>
          <p className="text-white text-lg font-bold leading-relaxed">{message.exercise}</p>
        </section>
      </div>
    </div>
  );
};

// --- Componentes de Visualização ---

const HistoryView: React.FC<{ history: StoicMessage[]; isPremium: boolean }> = ({ history, isPremium }) => (
  <div className="space-y-12 animate-fade">
    <div className="flex flex-col gap-2">
      <h2 className="text-3xl font-serif font-bold text-white">Arquivo Sagrado</h2>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sua jornada de sabedoria</p>
    </div>
    {history.length === 0 ? (
      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-gray-600 font-serif italic">Seu arquivo está vazio. Comece hoje.</div>
    ) : (
      <div className="space-y-16">
        {history.map((msg) => (
          <div key={msg.id} className="relative pl-8 border-l border-white/10">
            <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] bg-amber-500 rounded-full" />
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
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Reflexões sobre o caráter</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="p-4 bg-white text-black rounded-2xl shadow-xl active:scale-95 transition-transform">
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={submit} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6 animate-fade">
          <textarea 
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que realizei hoje que foi virtuoso? Onde a razão falhou?"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white font-serif text-lg italic focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[180px]"
          />
          <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-colors">Registrar Reflexão</button>
        </form>
      )}

      <div className="grid gap-6">
        {entries.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-gray-600 font-serif italic">Seu diário aguarda suas primeiras lições.</div>
        ) : entries.map(entry => (
          <div key={entry.id} className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 space-y-4">
            <span className="text-[10px] font-black text-amber-500/40 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
            <p className="text-gray-200 font-serif text-lg italic leading-relaxed">"{entry.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PremiumView: React.FC<{ isPremium: boolean }> = ({ isPremium }) => (
  <div className="space-y-12 animate-fade pb-10">
    <div className="text-center space-y-6">
      <div className="inline-flex p-6 rounded-3xl bg-amber-500/10 text-amber-500 shadow-2xl mb-4"><Crown size={64} strokeWidth={1.5} /></div>
      <h2 className="text-4xl font-serif font-bold text-white">Domine a si mesmo</h2>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">Caminho para a Eudaimonia</p>
    </div>

    {isPremium ? (
      <div className="bg-amber-500/10 border border-amber-500/20 p-10 rounded-[3rem] text-center space-y-4">
        <CheckCircle2 size={40} className="text-amber-500 mx-auto" />
        <h3 className="text-2xl font-serif text-white">Sabedoria Plena Ativa</h3>
        <p className="text-gray-400 text-sm">Você é um membro da elite estoica. Seu acesso é ilimitado.</p>
      </div>
    ) : (
      <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-8">
        <ul className="space-y-5">
          {['Lições diárias ilimitadas', 'Acesso total ao Arquivo Sagrado', 'Diário de reflexão sem limites', 'Inteligência Estoica Prioritária', 'Suporte à jornada espiritual'].map((f, i) => (
            <li key={i} className="flex items-center gap-4 text-sm font-bold text-gray-300">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500"><CheckCircle2 size={12} /></div>
              {f}
            </li>
          ))}
        </ul>
        <div className="pt-4 space-y-6">
          <div className="text-center">
            <span className="text-5xl font-black text-white tracking-tighter">R$ 9,90</span>
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-3">Pagamento único</span>
          </div>
          <button onClick={() => window.open(STRIPE_PAYMENT_LINK, '_blank')} className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-500 transition-all shadow-2xl active:scale-95">Tornar-se Elite</button>
        </div>
      </div>
    )}
  </div>
);

// --- Componente Principal ---

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('today');
  const [loading, setLoading] = useState(false);
  const [userState, setUserState] = useState<UserState>({ 
    authUser: null, 
    isPremium: false, 
    messageCount: 0, 
    history: [], 
    journal: [] 
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchProfile = async (userId: string) => {
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
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const authUser = { email: session.user.email!, uid: session.user.id, name: session.user.user_metadata?.full_name };
        setUserState(prev => ({ ...prev, authUser }));
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

  const handleGenerate = async () => {
    if (!userState.isPremium && userState.messageCount >= 1) { setView('premium'); return; }
    if (!userState.authUser) return;
    
    setLoading(true);
    try {
      const newMessage = await generateStoicMessage(userState.history);
      await supabase.from('history').insert({ user_id: userState.authUser.uid, content: newMessage });
      await supabase.rpc('increment_message_counter', { user_id: userState.authUser.uid });
      
      setUserState(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1,
        history: [newMessage, ...prev.history]
      }));
    } catch (err) {
      alert("Erro ao conectar com a sabedoria estoica.");
    } finally {
      setLoading(false);
    }
  };

  const addJournalEntry = async (content: string) => {
    if (!userState.authUser) return;
    try {
      const { data, error } = await supabase.from('journal').insert({ user_id: userState.authUser.uid, content }).select().single();
      if (error) throw error;
      setUserState(prev => ({
        ...prev,
        journal: [{ id: data.id, date: data.created_at, content: data.content, title: 'Reflexão' }, ...prev.journal]
      }));
    } catch (err) { alert("Erro ao salvar no diário."); }
  };

  const deleteAccount = async () => {
    if (!userState.authUser) return;
    try {
      setLoading(true);
      await supabase.from('profiles').delete().eq('id', userState.authUser.uid);
      await supabase.auth.signOut();
    } catch (err) { alert("Erro ao deletar conta."); } finally { setLoading(false); setShowDeleteModal(false); }
  };

  if (!userState.authUser) return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-[#0f1115]">
      <div className="w-full max-w-sm text-center space-y-12 animate-fade">
        <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center font-serif text-black text-6xl font-black mx-auto shadow-2xl">E</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-serif font-bold text-white">Estoicismo AI</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.4em]">Sua bússola moral</p>
        </div>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} 
          className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-transform"
        >
          <Mail size={18} /> Continuar com Google
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-8 min-h-screen relative bg-[#0f1115] text-white selection:bg-amber-500/40 custom-scrollbar">
      <header className="py-10 flex justify-between items-center border-b border-white/5 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center font-serif text-black text-3xl font-black">E</div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-bold text-white">Estoicismo</h1>
            <span className="text-[10px] uppercase tracking-[0.4em] text-amber-500/80 font-black">Discípulo</span>
          </div>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="p-3.5 rounded-2xl bg-white/5 text-gray-500 hover:text-red-400 transition-colors"><User size={22} /></button>
      </header>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-10">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-[#1a1c23] border border-red-500/20 p-10 rounded-[3rem] text-center space-y-8 animate-fade">
            <AlertTriangle size={48} className="text-red-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Gerenciar Cidadela</h3>
              <p className="text-gray-500 text-sm">Deseja apagar todos os registros de sua jornada?</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={deleteAccount} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest">Excluir tudo</button>
              <button onClick={() => supabase.auth.signOut()} className="w-full bg-white/5 text-gray-400 py-4 rounded-xl font-bold text-xs uppercase tracking-widest">Sair da conta</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full text-gray-600 py-2 text-[10px] font-bold uppercase tracking-widest">Voltar</button>
            </div>
          </div>
        </div>
      )}

      <main className="pb-36">
        {view === 'today' && (
          <div className="space-y-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6">
                <Loader2 className="animate-spin text-amber-500" size={64} strokeWidth={1} />
                <p className="text-white font-serif text-2xl italic text-center px-10">"A virtude é o único bem."</p>
              </div>
            ) : userState.history[0] ? (
              <StoicCard message={userState.history[0]} isPremium={userState.isPremium} />
            ) : (
              <div className="text-center py-20 space-y-10 animate-fade">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full" />
                  <Sparkles size={100} className="text-amber-500 relative z-10 opacity-40 mx-auto" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-serif font-bold text-white">Sua mente está pronta?</h3>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest px-10 leading-relaxed">O dia de hoje é um presente para ser usado com propósito.</p>
                </div>
                <button 
                  onClick={handleGenerate} 
                  className="group bg-white text-black px-14 py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-amber-500 transition-all flex items-center gap-4 mx-auto"
                >
                  INICIAR PRÁTICA <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
            
            {!loading && userState.history[0] && !userState.isPremium && userState.messageCount >= 1 && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-10 rounded-[3rem] text-center space-y-6">
                <Crown size={32} className="text-amber-500 mx-auto" />
                <h4 className="text-xl font-serif text-white">O obstáculo é o caminho</h4>
                <p className="text-gray-500 text-sm leading-relaxed px-4">Para aprofundar seu autodomínio sem limites, torne-se um membro elite.</p>
                <button onClick={() => setView('premium')} className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Acessar Sabedoria Plena</button>
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