import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Home from './Home'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // cadastro
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

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

  async function handleRegister() {
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    // cria perfil FREE
    await supabase.from('profiles').insert({
      id: data.user?.id,
      name,
      is_premium: false,
    })
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
    return <p style={{ textAlign: 'center' }}>Carregando...</p>
  }

  if (user) {
    return <Home />
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={{ textAlign: 'center' }}>Estoicismo AI</h1>

        {isRegister && (
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={input}
          />
        )}

        <input
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

        {isRegister ? (
          <button style={button} onClick={handleRegister}>
            Criar conta gratuita
          </button>
        ) : (
          <button style={button} onClick={handleLogin}>
            Entrar
          </button>
        )}

        <button style={googleButton} onClick={loginWithGoogle}>
          Entrar com Google
        </button>

        <p
          style={{ marginTop: 16, cursor: 'pointer', opacity: 0.7 }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? 'Já tem conta? Entrar'
            : 'Não tem conta? Criar conta grátis'}
        </p>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0f1115',
  color: '#e5e7eb',
}

const card: React.CSSProperties = {
  width: 360,
  padding: 24,
  borderRadius: 12,
  background: '#111827',
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: '1px solid #2a2d33',
  background: '#0f1115',
  color: '#e5e7eb',
}

const button: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: 'none',
  background: '#f59e0b',
  color: '#0f1115',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginBottom: 8,
}

const googleButton: React.CSSProperties = {
  ...button,
  background: '#020617',
  color: '#e5e7eb',
  border: '1px solid #2a2d33',
}
