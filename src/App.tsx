import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verifica sessão ao carregar
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Escuta mudanças de login/logout
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

  async function logout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={center}>
        <p>Carregando...</p>
      </div>
    )
  }

  // 🔐 TELA LOGADA
  if (user) {
    return (
      <div style={center}>
        <h1>Bem-vindo ao Estoicismo AI</h1>
        <p>{user.email}</p>

        <button style={button} onClick={logout}>
          Sair
        </button>
      </div>
    )
  }

  // 🔓 TELA DE LOGIN
  return (
    <div style={center}>
      <div style={{ width: 360 }}>
        <h1 style={{ textAlign: 'center' }}>Estoicismo AI</h1>

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

        {error && <p style={{ color: 'red' }}>{error}</p>}

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
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 6,
}

const button: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginTop: 10,
  background: '#f59e0b',
  border: 'none',
  cursor: 'pointer',
}

const googleButton: React.CSSProperties = {
  ...button,
  background: '#111',
  color: '#fff',
  border: '1px solid #333',
}

export default App
