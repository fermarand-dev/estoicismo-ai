import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Home from './Home'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verifica sessão ao carregar
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleLogin() {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError(error.message)
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  if (loading) {
    return (
      <div style={center}>
        <p>Carregando...</p>
      </div>
    )
  }

  // 🔐 Usuário logado → Home
  if (user) {
    return <Home user={user} />
  }

  // 🔓 Usuário não logado → Login
  return (
    <div style={center}>
      <div style={{ width: 360 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 8 }}>
          Estoicismo AI
        </h1>
        <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: 24 }}>
          A virtude como bússola
        </p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        {error && <p style={{ color: '#f87171' }}>{error}</p>}

        <button style={button} onClick={handleLogin}>
          Entrar
        </button>

        <button style={googleButton} onClick={loginWithGoogle}>
          Entrar com Google
        </button>
      </div>
    </div>
  )
}

const center: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0b0d10',
  color: '#fff',
  fontFamily: 'Inter, sans-serif',
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 6,
  border: '1px solid #2a2d33',
  backgroundColor: '#0b0d10',
  color: '#e5e7eb',
}

const button: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginTop: 10,
  background: '#f59e0b',
  border: 'none',
  borderRadius: 6,
  fontWeight: 'bold',
  cursor: 'pointer',
}

const googleButton: React.CSSProperties = {
  ...button,
  background: '#111',
  color: '#fff',
  border: '1px solid #333',
}

export default App
